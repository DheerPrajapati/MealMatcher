/*
  Warnings:

  - You are about to drop the column `groupId` on the `DecisionSession` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `cuisine` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `priceRange` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupMembership` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DecisionSession" DROP CONSTRAINT "DecisionSession_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "GroupMembership" DROP CONSTRAINT "GroupMembership_groupId_fkey";

-- DropForeignKey
ALTER TABLE "GroupMembership" DROP CONSTRAINT "GroupMembership_userId_fkey";

-- AlterTable
ALTER TABLE "DecisionSession" DROP COLUMN "groupId";

-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "createdAt",
DROP COLUMN "cuisine",
DROP COLUMN "imageUrl",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "priceRange",
DROP COLUMN "state",
DROP COLUMN "updatedAt",
DROP COLUMN "zipCode";

-- DropTable
DROP TABLE "Group";

-- DropTable
DROP TABLE "GroupMembership";

-- CreateTable
CREATE TABLE "DecisionSessionParticipant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "sessionId" INTEGER NOT NULL,

    CONSTRAINT "DecisionSessionParticipant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DecisionSessionParticipant" ADD CONSTRAINT "DecisionSessionParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DecisionSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
