-- AlterTable
ALTER TABLE "User" ADD COLUMN     "desktopLayout" JSONB,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mobileLayout" JSONB,
ADD COLUMN     "publishedAt" TIMESTAMP(3);
