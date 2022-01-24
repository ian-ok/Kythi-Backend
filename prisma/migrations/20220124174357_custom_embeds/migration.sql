-- CreateTable
CREATE TABLE "UserEmbed" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "title" TEXT DEFAULT E':filename:',
    "description" TEXT DEFAULT E'Kythi.com | :uploadcount:',
    "color" TEXT DEFAULT E'RANDOM',
    "authorText" TEXT DEFAULT E':username:',
    "authorUrl" TEXT,
    "siteText" TEXT DEFAULT E':date: | :filesize:',
    "siteUrl" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserEmbed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileEmbed" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "title" TEXT,
    "description" TEXT,
    "color" TEXT,
    "authorText" TEXT,
    "authorUrl" TEXT,
    "siteText" TEXT,
    "siteUrl" TEXT,
    "fileId" TEXT NOT NULL,

    CONSTRAINT "FileEmbed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserEmbed_id_key" ON "UserEmbed"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FileEmbed_id_key" ON "FileEmbed"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FileEmbed_fileId_key" ON "FileEmbed"("fileId");

-- AddForeignKey
ALTER TABLE "UserEmbed" ADD CONSTRAINT "UserEmbed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileEmbed" ADD CONSTRAINT "FileEmbed_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("cdnName") ON DELETE RESTRICT ON UPDATE CASCADE;
