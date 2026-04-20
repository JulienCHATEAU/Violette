"use client";
import { useEffect, useState } from "react";
import { Bell, BellOff, Send } from "lucide-react";

type PermState = "default" | "granted" | "denied" | "unsupported";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) arr[i] = raw.charCodeAt(i);
  return arr;
}

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
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
        Ton navigateur ne supporte pas les notifications push. Essaie depuis Chrome/Firefox, ou sur iOS
        installe Violette comme PWA (iOS 16.4+).
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {state !== "granted" && (
          <button
            onClick={enable}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2 disabled:opacity-60 transition"
          >
            <Bell size={16} strokeWidth={2} />
            {busy ? "…" : "Activer les notifications"}
          </button>
        )}
        {state === "granted" && (
          <>
            <button
              onClick={sendTest}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 text-violet-700 hover:bg-violet-50 px-4 py-2 font-medium transition"
            >
              <Send size={16} strokeWidth={2} />
              Envoyer un test
            </button>
            <button
              onClick={unsubscribe}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 px-4 py-2 font-medium transition"
            >
              <BellOff size={16} strokeWidth={2} />
              Désactiver
            </button>
          </>
        )}
      </div>
      {state === "denied" && (
        <p className="text-sm text-rose-700">
          Les notifications sont bloquées. Ouvre les réglages du site dans ton navigateur et autorise-les.
        </p>
      )}
      {msg && <p className="text-sm text-zinc-600 dark:text-zinc-300">{msg}</p>}
    </div>
  );
}
