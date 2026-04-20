/*
  Warnings:

  - Added the required column `ownerId` to the `Plant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `PushSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Plant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "description" TEXT,
    "species" TEXT,
    "wateringFrequencyDays" INTEGER NOT NULL DEFAULT 7,
    "lastWateredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sunlightExposure" TEXT NOT NULL DEFAULT 'indirect_light',
    "humidity" TEXT NOT NULL DEFAULT 'medium',
    "temperatureRange" TEXT,
    "notes" TEXT,
    "photo" BLOB,
    "photoMime" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Plant_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Plant" ("createdAt", "description", "humidity", "id", "lastWateredAt", "name", "nickname", "notes", "species", "sunlightExposure", "temperatureRange", "updatedAt", "wateringFrequencyDays") SELECT "createdAt", "description", "humidity", "id", "lastWateredAt", "name", "nickname", "notes", "species", "sunlightExposure", "temperatureRange", "updatedAt", "wateringFrequencyDays" FROM "Plant";
DROP TABLE "Plant";
ALTER TABLE "new_Plant" RENAME TO "Plant";
CREATE INDEX "Plant_ownerId_idx" ON "Plant"("ownerId");
CREATE TABLE "new_PushSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wateringRemindersEnabled" BOOLEAN NOT NULL DEFAULT true,
    "greetingsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "greetingsPerDay" INTEGER NOT NULL DEFAULT 1,
    "quietHoursStart" INTEGER DEFAULT 22,
    "quietHoursEnd" INTEGER DEFAULT 8,
    "userId" TEXT NOT NULL,
    CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PushSubscription" ("auth", "createdAt", "endpoint", "greetingsEnabled", "greetingsPerDay", "id", "p256dh", "quietHoursEnd", "quietHoursStart", "userAgent", "wateringRemindersEnabled") SELECT "auth", "createdAt", "endpoint", "greetingsEnabled", "greetingsPerDay", "id", "p256dh", "quietHoursEnd", "quietHoursStart", "userAgent", "wateringRemindersEnabled" FROM "PushSubscription";
DROP TABLE "PushSubscription";
ALTER TABLE "new_PushSubscription" RENAME TO "PushSubscription";
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
