-- DropForeignKey
ALTER TABLE "SavedWork" DROP CONSTRAINT "SavedWork_studentId_fkey";

-- AddForeignKey
ALTER TABLE "SavedWork" ADD CONSTRAINT "SavedWork_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
