// Create a Violette user from inside a running container.
// Designed to be run from the Northflank shell on the `web` service.
//
// Usage:
//   PASSWORD='strong-pwd' node scripts/user-create.js <username> [displayName]
//
// Password is read from the PASSWORD env var (kept out of argv / shell history).

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const username = process.argv[2];
const displayName = process.argv[3] ?? username;
const password = process.env.PASSWORD;

if (!username || !password) {
  console.error(
    "Usage: PASSWORD='strong-pwd' node scripts/user-create.js <username> [displayName]"
  );
  process.exit(1);
}

(async () => {
  const prisma = new PrismaClient();
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, displayName, passwordHash },
    });
    console.log(`Created user: ${user.id} (${user.username})`);
  } catch (err) {
    console.error("Failed to create user:", err.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
