-- CreateEnum
CREATE TYPE "FurnishingStatus" AS ENUM ('FURNISHED', 'UNFURNISHED');

-- AlterTable
ALTER TABLE "Property"
ADD COLUMN "furnishingStatus" "FurnishingStatus" NOT NULL DEFAULT 'FURNISHED',
ADD COLUMN "squareMeters" INTEGER NOT NULL DEFAULT 20;
