/**
 * Dev cron: hits the local API endpoints to simulate Vercel Cron.
 * Run in a second terminal:  npm run cron:dev
 */
import cron from "node-cron";

const BASE = process.env.APP_URL ?? "http://localhost:3000";
const SECRET = process.env.CRON_SECRET;

if (!SECRET) {
  console.error("CRON_SECRET missing in env");
  process.exit(1);
}

async function trigger(path: string) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "x-cron-secret": SECRET! },
    });
    const body = await res.text();
    console.log(`[${new Date().toISOString()}] ${path} → ${res.status} ${body.slice(0, 200)}`);
  } catch (err) {
    console.warn(`[${new Date().toISOString()}] ${path} ERROR`, err);
  }
}

// Watering reminders: every hour at :05
cron.schedule("5 * * * *", () => trigger("/api/cron/watering-reminders"));

// Random greeting: 11h and 17h (tweak to taste)
cron.schedule("0 11,17 * * *", () => trigger("/api/cron/random-greeting"));

console.log("⏰ dev-cron running. Next.js must be up on", BASE);
console.log("   - watering-reminders  hourly (:05)");
console.log("   - random-greeting     11:00 and 17:00");

// Fire once on startup for immediate feedback
void trigger("/api/cron/watering-reminders");
