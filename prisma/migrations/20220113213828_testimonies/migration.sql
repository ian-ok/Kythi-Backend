-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "messageId" TEXT,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Testimonial_id_key" ON "Testimonial"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Testimonial_messageId_key" ON "Testimonial"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "Testimonial_authorId_key" ON "Testimonial"("authorId");

-- AddForeignKey
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
