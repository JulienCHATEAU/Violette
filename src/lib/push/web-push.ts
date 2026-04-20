import webpush from "web-push";
import { prisma } from "@/lib/db";

let configured = false;

function configure() {
  if (configured) return;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:noreply@violette.local";
  if (!pub || !priv) {
    throw new Error("VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY not configured. Run `npm run vapid:generate`.");
  }
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  plantId?: string;
  tag?: string;
  icon?: string;
};

export async function sendPushTo(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload,
): Promise<{ ok: true } | { ok: false; status?: number; error: string; gone?: boolean }> {
  configure();
  try {
    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
      JSON.stringify(payload),
      { TTL: 60 * 60 * 24 },
    );
    return { ok: true };
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode;
    const gone = status === 404 || status === 410;
    if (gone) {
      await prisma.pushSubscription.deleteMany({ where: { endpoint: subscription.endpoint } });
    }
    return { ok: false, status, error: (err as Error).message, gone };
  }
}
