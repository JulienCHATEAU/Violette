import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.wateringLog.deleteMany();
  await prisma.pushMessage.deleteMany();
  await prisma.plant.deleteMany();

  const now = Date.now();
  const day = 86_400_000;

  await prisma.plant.createMany({
    data: [
      {
        name: "Monstera Deliciosa",
        nickname: "Gérard",
        species: "Monstera deliciosa",
        description: "Plante tropicale à grandes feuilles découpées, très expressive.",
        wateringFrequencyDays: 7,
        lastWateredAt: new Date(now - 8 * day), // en retard d'1 jour
        sunlightExposure: "indirect_light",
        humidity: "high",
        temperatureRange: "18-27°C",
        notes: "Vaporiser les feuilles 1x/semaine.",
        photoUrl: null,
      },
      {
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
        photoUrl: null,
      },
      {
        name: "Ficus Lyrata",
        nickname: "Figaro",
        species: "Ficus lyrata",
        description: "Ficus à feuilles en violon, majestueux mais susceptible.",
        wateringFrequencyDays: 7,
        lastWateredAt: new Date(now - 7 * day), // due aujourd'hui
        sunlightExposure: "indirect_light",
        humidity: "medium",
        temperatureRange: "18-24°C",
        notes: "Déteste qu'on le déplace.",
        photoUrl: null,
      },
    ],
  });

  const count = await prisma.plant.count();
  console.log(`🌿 Seed: ${count} plantes créées.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
