/*
  Warnings:

  - You are about to drop the column `verified` on the `Testimonial` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TestimonialStatus" AS ENUM ('PENDING', 'DENIED', 'ACCEPTED');

-- AlterTable
ALTER TABLE "Testimonial" DROP COLUMN "verified",
ADD COLUMN     "status" "TestimonialStatus" NOT NULL DEFAULT E'PENDING';
