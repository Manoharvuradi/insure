/*
  Warnings:

  - Added the required column `email` to the `SmsVerfication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SmsVerfication" ADD COLUMN     "email" TEXT NOT NULL;
