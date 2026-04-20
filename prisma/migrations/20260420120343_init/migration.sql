-- CreateTable
CREATE TABLE "Plant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "photoUrl" TEXT,
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

-- CreateTable
CREATE TABLE "WateringLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plantId" TEXT NOT NULL,
    "wateredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    CONSTRAINT "WateringLog_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PushSubscription" (
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
    "quietHoursEnd" INTEGER DEFAULT 8
);

-- CreateTable
CREATE TABLE "PushMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plantId" TEXT,
    "kind" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL,
    CONSTRAINT "PushMessage_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "WateringLog_plantId_wateredAt_idx" ON "WateringLog"("plantId", "wateredAt");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "PushMessage_plantId_kind_sentAt_idx" ON "PushMessage"("plantId", "kind", "sentAt");
