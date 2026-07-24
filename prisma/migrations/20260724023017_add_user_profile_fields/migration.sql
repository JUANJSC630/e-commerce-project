-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNDISCLOSED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthDate" DATE,
ADD COLUMN     "docId" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "phone" TEXT;
