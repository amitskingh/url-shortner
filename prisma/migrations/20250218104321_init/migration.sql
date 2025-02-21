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
    "userId" INTEGER NOT NULL,
    "longURLId" INTEGER NOT NULL,
    "alias" TEXT NOT NULL,
    "clickCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LongURL_originalUrl_key" ON "LongURL"("originalUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Alias_alias_key" ON "Alias"("alias");

-- AddForeignKey
ALTER TABLE "Alias" ADD CONSTRAINT "Alias_longURLId_fkey" FOREIGN KEY ("longURLId") REFERENCES "LongURL"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alias" ADD CONSTRAINT "Alias_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
