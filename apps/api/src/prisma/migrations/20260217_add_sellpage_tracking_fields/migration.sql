-- AlterTable
ALTER TABLE "sellpages"
ADD COLUMN "sellpage_domain" VARCHAR(255),
ADD COLUMN "facebook_pixel_id" VARCHAR(100),
ADD COLUMN "tiktok_pixel_id" VARCHAR(100),
ADD COLUMN "google_analytics_id" VARCHAR(100),
ADD COLUMN "google_tag_manager_id" VARCHAR(100);
