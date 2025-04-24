/*
  Warnings:

  - A unique constraint covering the columns `[googlePlaceId]` on the table `Restaurant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "googlePlaceId" TEXT,
ADD COLUMN     "isOpen" BOOLEAN,
ADD COLUMN     "priceLevel" INTEGER,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "types" TEXT,
ADD COLUMN     "userTotalRating" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_googlePlaceId_key" ON "Restaurant"("googlePlaceId");
