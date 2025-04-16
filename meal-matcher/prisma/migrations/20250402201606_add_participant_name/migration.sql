/*
  Warnings:

  - A unique constraint covering the columns `[sessionItemId,participantName]` on the table `RestaurantVote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `participantName` to the `RestaurantVote` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "RestaurantVote_userId_sessionItemId_key";

-- AlterTable
ALTER TABLE "RestaurantVote" ADD COLUMN     "participantName" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantVote_sessionItemId_participantName_key" ON "RestaurantVote"("sessionItemId", "participantName");
