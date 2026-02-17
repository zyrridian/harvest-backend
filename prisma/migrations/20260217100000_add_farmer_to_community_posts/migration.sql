-- AlterTable
ALTER TABLE "community_posts" ADD COLUMN "farmer_id" TEXT;

-- CreateIndex
CREATE INDEX "community_posts_farmer_id_idx" ON "community_posts"("farmer_id");

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
