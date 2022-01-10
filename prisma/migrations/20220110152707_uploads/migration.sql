/*
  Warnings:

  - A unique constraint covering the columns `[uploadKey]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "uploadKey" TEXT;

-- CreateTable
CREATE TABLE "UploadSettings" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UploadSettings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "File" (
    "fileName" TEXT NOT NULL,
    "cdnName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaderId" TEXT NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("cdnName")
);

-- CreateIndex
CREATE UNIQUE INDEX "UploadSettings_key_key" ON "UploadSettings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "File_cdnName_key" ON "File"("cdnName");

-- CreateIndex
CREATE UNIQUE INDEX "User_uploadKey_key" ON "User"("uploadKey");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_uploadKey_fkey" FOREIGN KEY ("uploadKey") REFERENCES "UploadSettings"("key") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
