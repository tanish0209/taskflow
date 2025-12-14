-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "ownerId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
