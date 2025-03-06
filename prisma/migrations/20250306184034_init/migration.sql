-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('MOBILE', 'TABLET', 'DESKTOP');

-- CreateEnum
CREATE TYPE "BrowserType" AS ENUM ('CHROME', 'FIREFOX', 'EDGE', 'SAFARI', 'OPERA', 'OTHER');

-- CreateEnum
CREATE TYPE "OSType" AS ENUM ('WINDOWS', 'MAC', 'LINUX', 'IOS', 'ANDROID', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firebaseId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LongURL" (
    "id" SERIAL NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LongURL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alias" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "longURLId" INTEGER NOT NULL,
    "alias" TEXT,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClickAnalytics" (
    "id" SERIAL NOT NULL,
    "aliasId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT NOT NULL,
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
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LongURL_originalUrl_key" ON "LongURL"("originalUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Alias_alias_key" ON "Alias"("alias");

-- CreateIndex
CREATE INDEX "ClickAnalytics_aliasId_idx" ON "ClickAnalytics"("aliasId");

-- AddForeignKey
ALTER TABLE "Alias" ADD CONSTRAINT "Alias_longURLId_fkey" FOREIGN KEY ("longURLId") REFERENCES "LongURL"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alias" ADD CONSTRAINT "Alias_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClickAnalytics" ADD CONSTRAINT "ClickAnalytics_aliasId_fkey" FOREIGN KEY ("aliasId") REFERENCES "Alias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
