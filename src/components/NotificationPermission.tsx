"use client";

import { useEffect, useState } from "react";
import { Button } from "@/design-system/components/Button";
import { Bell, BellOff, Info, Send } from "@/design-system/icons";

type PermState = "default" | "granted" | "denied" | "unsupported";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) arr[i] = raw.charCodeAt(i);
  return arr;
}

/**
 * NotificationPermission — UI surface for the web-push opt-in flow.
 *
 * UI was repainted to use the design system (Button + DS icons + paper palette).
 * The push subscription pipeline (VAPID, syncSubscription, enable, sendTest,
 * unsubscribe, console-based debug logs) is preserved verbatim — see CLAUDE.md §8
 * which puts the push backend out of scope for this phase.
 */
export function NotificationPermission() {
  const [state, setState] = useState<PermState>("default");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    const current = Notification.permission as PermState;
    setState(current);

    // If permission was granted in a previous session, ensure the server has
    // the subscription registered for the current user.
    if (current === "granted") {
      void syncSubscription();
    }
  }, []);

  const syncSubscription = async (): Promise<boolean> => {
    console.log("[push] sync → start");
    try {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      console.log("[push] vapidKey present?", !!vapidKey, "length:", vapidKey?.length);
      if (!vapidKey) {
        setMsg("VAPID key absente côté client.");
        return false;
      }
      if (!("serviceWorker" in navigator)) {
        setMsg("Service worker non supporté.");
        return false;
      }
      let reg = await navigator.serviceWorker.getRegistration("/");
      console.log("[push] getRegistration →", reg?.scope ?? "none");
      if (!reg) {
        console.log("[push] registering /sw.js manually…");
        reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      }
      if (!reg.active) {
        console.log("[push] waiting for SW to activate…");
        await new Promise<void>((resolve, reject) => {
          const sw = reg!.installing ?? reg!.waiting;
          if (!sw) return resolve();
          const timer = setTimeout(() => reject(new Error("SW activation timeout")), 10_000);
          sw.addEventListener("statechange", () => {
            console.log("[push] SW state:", sw.state);
            if (sw.state === "activated") {
              clearTimeout(timer);
              resolve();
            } else if (sw.state === "redundant") {
              clearTimeout(timer);
              reject(new Error("SW became redundant"));
            }
          });
        });
      }
      console.log("[push] SW ready, active:", !!reg.active);
      let sub = await reg.pushManager.getSubscription();
      console.log("[push] existing subscription?", !!sub);
      if (!sub) {
        console.log("[push] calling pushManager.subscribe…");
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as BufferSource,
        });
        console.log("[push] subscribed, endpoint:", sub.endpoint.slice(0, 60));
      }
      console.log("[push] POST /api/push/subscribe…");
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          userAgent: navigator.userAgent,
        }),
      });
      console.log("[push] subscribe response:", res.status);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        setMsg(`Sync subscription échoué : HTTP ${res.status} ${text}`);
        return false;
      }
      return true;
    } catch (err) {
      console.error("[push] sync failed", err);
      setMsg(`Erreur sync push : ${(err as Error).message}`);
      return false;
    }
  };

  const enable = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const perm = await Notification.requestPermission();
      setState(perm as PermState);
      if (perm !== "granted") {
        setMsg("Permission refusée. Réactive-la dans les réglages du navigateur.");
        return;
      }
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setMsg("VAPID public key manquante côté client.");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as BufferSource,
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          userAgent: navigator.userAgent,
        }),
      });
      if (!res.ok) throw new Error("subscribe failed");
      setMsg("Notifications activées ! Tes plantes vont pouvoir te parler 🌿");
    } catch (err) {
      console.error(err);
      setMsg("Erreur d'activation. Réessaie.");
    } finally {
      setBusy(false);
    }
  };

  const sendTest = async () => {
    setBusy(true);
    setMsg(null);
    let res = await fetch("/api/push/test", { method: "POST" });
    if (res.status === 404) {
      // No subscription for this user — try to sync then retry once.
      const ok = await syncSubscription();
      if (ok) res = await fetch("/api/push/test", { method: "POST" });
    }
    setMsg(res.ok ? "Test envoyé 📬" : `Échec (HTTP ${res.status}). Voir console.`);
    setBusy(false);
  };

  const unsubscribe = async () => {
    setBusy(true);
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    }
    setState("default");
    setMsg("Désinscription effectuée.");
    setBusy(false);
  };

  if (state === "unsupported") {
    return (
      <div className="flex items-start gap-3 rounded-organic-3 border border-paper-300 bg-paper-100 p-4 text-sm text-ink-800">
        <Info size={18} className="text-ink-600 mt-0.5 shrink-0" />
        <p className="font-sans leading-relaxed">
          Ton navigateur ne supporte pas les notifications push. Essaie depuis Chrome/Firefox, ou sur iOS
          installe Violette comme PWA (iOS 16.4+).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {state !== "granted" ? (
          <Button
            type="button"
            variant="cta"
            size="sm"
            onClick={enable}
            disabled={busy}
            leadingIcon={<Bell size={16} />}
          >
            {busy ? "…" : "Activer les notifications"}
          </Button>
        ) : null}
        {state === "granted" ? (
          <>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={sendTest}
              disabled={busy}
              leadingIcon={<Send size={16} />}
            >
              Envoyer un test
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={unsubscribe}
              disabled={busy}
              leadingIcon={<BellOff size={16} />}
              className="!text-terracotta-600 hover:!bg-terracotta-50"
            >
              Désactiver
            </Button>
          </>
        ) : null}
      </div>
      {state === "denied" ? (
        <p className="font-sans text-sm text-terracotta-600" role="alert">
          Les notifications sont bloquées. Ouvre les réglages du site dans ton navigateur et autorise-les.
        </p>
      ) : null}
      {msg ? <p className="font-sans text-sm text-ink-600">{msg}</p> : null}
    </div>
  );
}
