/*
  Warnings:

  - You are about to drop the column `arrangements` on the `songs` table. All the data in the column will be lost.
  - Added the required column `arrangement` to the `songs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `author` to the `songs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `songs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "songs" DROP COLUMN "arrangements",
ADD COLUMN     "arrangement" TEXT NOT NULL,
ADD COLUMN     "author" VARCHAR(30) NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL;
