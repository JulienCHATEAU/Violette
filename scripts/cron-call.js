// Tiny helper invoked by Northflank scheduled jobs.
// Posts to a Violette cron endpoint with the shared CRON_SECRET header.
//
// Usage:  node scripts/cron-call.js /api/cron/watering-reminders
//
// Env required:  APP_URL, CRON_SECRET

const endpoint = process.argv[2];
if (!endpoint) {
  console.error("Usage: cron-call.js <endpoint>");
  process.exit(1);
}

const base = process.env.APP_URL;
const secret = process.env.CRON_SECRET;
if (!base || !secret) {
  console.error("APP_URL and CRON_SECRET must be set");
  process.exit(1);
}

const url = base.replace(/\/$/, "") + endpoint;

fetch(url, {
  method: "POST",
  headers: { "x-cron-secret": secret },
})
  .then(async (res) => {
    const body = (await res.text()).slice(0, 500);
    console.log(`${new Date().toISOString()} ${res.status} ${endpoint} ${body}`);
    if (!res.ok) process.exit(1);
  })
  .catch((err) => {
    console.error(`${new Date().toISOString()} ERROR ${endpoint}`, err);
    process.exit(1);
  });
