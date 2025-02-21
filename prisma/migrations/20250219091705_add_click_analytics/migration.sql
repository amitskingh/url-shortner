-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('MOBILE', 'TABLET', 'DESKTOP');

-- CreateEnum
CREATE TYPE "BrowserType" AS ENUM ('CHROME', 'FIREFOX', 'EDGE', 'SAFARI', 'OPERA', 'OTHER');

-- CreateEnum
CREATE TYPE "OSType" AS ENUM ('WINDOWS', 'MAC', 'LINUX', 'IOS', 'ANDROID', 'OTHER');

-- CreateTable
CREATE TABLE "ClickAnalytics" (
    "id" SERIAL NOT NULL,
    "aliasId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" INET NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "device" "DeviceType",
    "browser" "BrowserType",
    "os" "OSType",

    CONSTRAINT "ClickAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClickAnalytics_aliasId_idx" ON "ClickAnalytics"("aliasId");

-- AddForeignKey
ALTER TABLE "ClickAnalytics" ADD CONSTRAINT "ClickAnalytics_aliasId_fkey" FOREIGN KEY ("aliasId") REFERENCES "Alias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
