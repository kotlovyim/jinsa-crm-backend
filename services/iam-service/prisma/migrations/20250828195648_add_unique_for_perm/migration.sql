/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Permission_title_key" ON "public"."Permission"("title");
