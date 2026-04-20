"use client";
import { useEffect, useState } from "react";

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
    setState(Notification.permission as PermState);
  }, []);

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
        setMsg("VAPID public key manquante côté client. Ajoute NEXT_PUBLIC_VAPID_PUBLIC_KEY dans .env.");
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
      setMsg("✨ Notifications activées ! Tes plantes vont pouvoir te parler 🌿");
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
    const res = await fetch("/api/push/test", { method: "POST" });
    setMsg(res.ok ? "Test envoyé 📬" : "Aucune subscription trouvée.");
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
            className="rounded-xl bg-leaf-600 hover:bg-leaf-700 text-white font-semibold px-4 py-2 disabled:opacity-60"
          >
            {busy ? "…" : "Activer les notifications"}
          </button>
        )}
        {state === "granted" && (
          <>
            <button
              onClick={sendTest}
              disabled={busy}
              className="rounded-xl border px-4 py-2 font-medium"
            >
              Envoyer un test
            </button>
            <button
              onClick={unsubscribe}
              disabled={busy}
              className="rounded-xl border border-red-300 text-red-700 px-4 py-2 font-medium"
            >
              Désactiver
            </button>
          </>
        )}
      </div>
      {state === "denied" && (
        <p className="text-sm text-red-700">
          Les notifications sont bloquées. Ouvre les réglages du site dans ton navigateur et autorise-les.
        </p>
      )}
      {msg && <p className="text-sm text-zinc-600 dark:text-zinc-300">{msg}</p>}
    </div>
  );
}
