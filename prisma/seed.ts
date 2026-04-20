import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Wipe children first (respect FKs)
  await prisma.wateringLog.deleteMany();
  await prisma.pushMessage.deleteMany();
  await prisma.pushSubscription.deleteMany();
  await prisma.plant.deleteMany();
  await prisma.user.deleteMany();

  const demo = await prisma.user.create({
    data: {
      username: "julien",
      passwordHash: await bcrypt.hash("violette", 10),
    },
  });

  const now = Date.now();
  const day = 86_400_000;

  await prisma.plant.createMany({
    data: [
      {
        ownerId: demo.id,
        name: "Monstera Deliciosa",
        nickname: "Gérard",
        species: "Monstera deliciosa",
        description: "Plante tropicale à grandes feuilles découpées, très expressive.",
        wateringFrequencyDays: 7,
        lastWateredAt: new Date(now - 8 * day),
        sunlightExposure: "indirect_light",
        humidity: "high",
        temperatureRange: "18-27°C",
        notes: "Vaporiser les feuilles 1x/semaine.",
      },
      {
        ownerId: demo.id,
        name: "Aloe Vera",
        nickname: "Alouette",
        species: "Aloe barbadensis miller",
        description: "Succulente robuste, parfaite pour les débutants.",
        wateringFrequencyDays: 14,
        lastWateredAt: new Date(now - 3 * day),
        sunlightExposure: "full_sun",
        humidity: "low",
        temperatureRange: "15-30°C",
        notes: "Laisser sécher le terreau entre deux arrosages.",
      },
      {
        ownerId: demo.id,
        name: "Ficus Lyrata",
        nickname: "Figaro",
        species: "Ficus lyrata",
        description: "Ficus à feuilles en violon, majestueux mais susceptible.",
        wateringFrequencyDays: 7,
        lastWateredAt: new Date(now - 7 * day),
        sunlightExposure: "indirect_light",
        humidity: "medium",
        temperatureRange: "18-24°C",
        notes: "Déteste qu'on le déplace.",
      },
    ],
  });

  const count = await prisma.plant.count();
  console.log(`🌿 Seed: user '${demo.username}' (password: violette) with ${count} plants.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
