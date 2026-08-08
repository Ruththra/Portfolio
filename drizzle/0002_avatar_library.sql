ALTER TABLE "media" ADD COLUMN "selected_avatar" boolean NOT NULL DEFAULT false;
CREATE UNIQUE INDEX "media_single_selected_avatar" ON "media" ("selected_avatar") WHERE "selected_avatar" = true;
