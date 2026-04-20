/*
  Warnings:

  - You are about to drop the column `photoUrl` on the `Plant` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `PushMessage` table. All the data in the column will be lost.

*/
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Plant" ("createdAt", "description", "humidity", "id", "lastWateredAt", "name", "nickname", "notes", "species", "sunlightExposure", "temperatureRange", "updatedAt", "wateringFrequencyDays") SELECT "createdAt", "description", "humidity", "id", "lastWateredAt", "name", "nickname", "notes", "species", "sunlightExposure", "temperatureRange", "updatedAt", "wateringFrequencyDays" FROM "Plant";
DROP TABLE "Plant";
ALTER TABLE "new_Plant" RENAME TO "Plant";
CREATE TABLE "new_PushMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plantId" TEXT,
    "kind" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PushMessage_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PushMessage" ("body", "id", "kind", "plantId", "sentAt") SELECT "body", "id", "kind", "plantId", "sentAt" FROM "PushMessage";
DROP TABLE "PushMessage";
ALTER TABLE "new_PushMessage" RENAME TO "PushMessage";
CREATE INDEX "PushMessage_plantId_kind_sentAt_idx" ON "PushMessage"("plantId", "kind", "sentAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
