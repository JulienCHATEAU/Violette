/**
 * Create or update a user.
 *   npm run user:create -- <username> <password>
 *
 * In production:
 *   railway run npm run user:create -- julien motdepasse
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const [, , rawUsername, password] = process.argv;
  if (!rawUsername || !password) {
    console.error("Usage: npm run user:create -- <username> <password>");
    process.exit(1);
  }
  const username = rawUsername.toLowerCase().trim();
  if (password.length < 6) {
    console.error("Password must be at least 6 characters.");
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { username },
    create: { username, passwordHash },
    update: { passwordHash },
  });
  console.log(`✅ User ${user.username} (${user.id}) saved.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
