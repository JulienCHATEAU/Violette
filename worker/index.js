/* eslint-disable no-restricted-globals */
// Custom service-worker additions appended to the next-pwa generated SW.
// Handles Web Push notifications for Violette (plantes qui parlent).

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Violette", body: event.data.text() };
  }

  const {
    title = "Violette",
    body = "",
    icon,
    badge,
    tag,
    url = "/",
    plantId,
  } = payload;

  const options = {
    body,
    tag: tag || plantId || "violette",
    renotify: Boolean(tag || plantId),
    data: { url },
    vibrate: [120, 60, 120],
    lang: "fr",
  };
  if (icon) options.icon = icon;
  if (badge) options.badge = badge;

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of allClients) {
        if (client.url.includes(targetUrl) && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })(),
  );
});
