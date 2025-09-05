-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "isOtpEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otpSecret" TEXT;
