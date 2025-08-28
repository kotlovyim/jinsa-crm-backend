/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."Roles" AS ENUM ('CEO', 'HR', 'TeamLead', 'TeamMember');

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "role";

-- DropEnum
DROP TYPE "public"."Role";

-- CreateTable
CREATE TABLE "public"."Role" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Permission" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_userRoles" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_userRoles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_rolePermission" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_rolePermission_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_userRoles_B_index" ON "public"."_userRoles"("B");

-- CreateIndex
CREATE INDEX "_rolePermission_B_index" ON "public"."_rolePermission"("B");

-- AddForeignKey
ALTER TABLE "public"."_userRoles" ADD CONSTRAINT "_userRoles_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_userRoles" ADD CONSTRAINT "_userRoles_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_rolePermission" ADD CONSTRAINT "_rolePermission_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_rolePermission" ADD CONSTRAINT "_rolePermission_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
