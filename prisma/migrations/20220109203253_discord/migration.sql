/*
  Warnings:

  - A unique constraint covering the columns `[discordId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "nitroType" AS ENUM ('NONE', 'CLASSIC', 'PREMIUM');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "discordId" TEXT;

-- CreateTable
CREATE TABLE "Discord" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "discriminator" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "banner" TEXT,
    "bannerColor" TEXT,
    "nitroType" "nitroType" NOT NULL,

    CONSTRAINT "Discord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Discord_id_key" ON "Discord"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Discord_tag_key" ON "Discord"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_discordId_fkey" FOREIGN KEY ("discordId") REFERENCES "Discord"("id") ON DELETE SET NULL ON UPDATE CASCADE;
