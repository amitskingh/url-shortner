-- DropForeignKey
ALTER TABLE "Alias" DROP CONSTRAINT "Alias_userId_fkey";

-- AlterTable
ALTER TABLE "Alias" ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "clickCount" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Alias" ADD CONSTRAINT "Alias_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
