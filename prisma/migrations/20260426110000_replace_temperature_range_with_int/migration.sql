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
    "temperature" INTEGER,
    "notes" TEXT,
    "photo" BLOB,
    "photoMime" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Plant_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Plant" ("createdAt", "description", "humidity", "id", "lastWateredAt", "name", "nickname", "notes", "ownerId", "photo", "photoMime", "species", "sunlightExposure", "updatedAt", "wateringFrequencyDays") SELECT "createdAt", "description", "humidity", "id", "lastWateredAt", "name", "nickname", "notes", "ownerId", "photo", "photoMime", "species", "sunlightExposure", "updatedAt", "wateringFrequencyDays" FROM "Plant";
DROP TABLE "Plant";
ALTER TABLE "new_Plant" RENAME TO "Plant";
CREATE INDEX "Plant_ownerId_idx" ON "Plant"("ownerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
