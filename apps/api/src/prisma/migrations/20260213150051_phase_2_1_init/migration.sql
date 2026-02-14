-- CreateEnum
CREATE TYPE "domain_verification_method" AS ENUM ('TXT', 'A_RECORD');

-- CreateEnum
CREATE TYPE "domain_status" AS ENUM ('PENDING', 'VERIFIED', 'FAILED');

-- AlterTable
ALTER TABLE "product_media" ADD COLUMN     "file_size" INTEGER,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "width" INTEGER;

-- CreateTable
CREATE TABLE "store_domains" (
    "id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "hostname" VARCHAR(255) NOT NULL,
    "verification_method" "domain_verification_method" NOT NULL DEFAULT 'TXT',
    "verification_token" VARCHAR(100) NOT NULL,
    "expected_a_record_ip" VARCHAR(45),
    "status" "domain_status" NOT NULL DEFAULT 'PENDING',
    "last_checked_at" TIMESTAMPTZ,
    "verified_at" TIMESTAMPTZ,
    "failure_reason" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "store_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_reviews" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "author_name" VARCHAR(255) NOT NULL,
    "avatar_url" VARCHAR(500),
    "rating" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at_override" TIMESTAMPTZ,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sellpage_preview_tokens" (
    "id" UUID NOT NULL,
    "sellpage_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sellpage_preview_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "store_domains_verification_token_key" ON "store_domains"("verification_token");

-- CreateIndex
CREATE INDEX "store_domains_store_id_idx" ON "store_domains"("store_id");

-- CreateIndex
CREATE INDEX "store_domains_status_idx" ON "store_domains"("status");

-- CreateIndex
CREATE UNIQUE INDEX "store_domains_store_id_hostname_key" ON "store_domains"("store_id", "hostname");

-- CreateIndex
CREATE INDEX "product_reviews_workspace_id_idx" ON "product_reviews"("workspace_id");

-- CreateIndex
CREATE INDEX "product_reviews_product_id_idx" ON "product_reviews"("product_id");

-- CreateIndex
CREATE INDEX "product_reviews_product_id_is_visible_idx" ON "product_reviews"("product_id", "is_visible");

-- CreateIndex
CREATE UNIQUE INDEX "sellpage_preview_tokens_token_hash_key" ON "sellpage_preview_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "sellpage_preview_tokens_sellpage_id_idx" ON "sellpage_preview_tokens"("sellpage_id");

-- CreateIndex
CREATE INDEX "sellpage_preview_tokens_token_hash_idx" ON "sellpage_preview_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "sellpage_preview_tokens_expires_at_idx" ON "sellpage_preview_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "product_media_product_id_position_idx" ON "product_media"("product_id", "position");

-- AddForeignKey
ALTER TABLE "store_domains" ADD CONSTRAINT "store_domains_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sellpage_preview_tokens" ADD CONSTRAINT "sellpage_preview_tokens_sellpage_id_fkey" FOREIGN KEY ("sellpage_id") REFERENCES "sellpages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sellpage_preview_tokens" ADD CONSTRAINT "sellpage_preview_tokens_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
