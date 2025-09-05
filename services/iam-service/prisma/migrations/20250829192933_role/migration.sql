/*
  Warnings:

  - You are about to drop the `_userRoles` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `roleId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."_userRoles" DROP CONSTRAINT "_userRoles_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_userRoles" DROP CONSTRAINT "_userRoles_B_fkey";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "roleId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."_userRoles";

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
