ALTER TABLE "research" ADD COLUMN "image_url" text;
ALTER TABLE "research" ADD COLUMN "image_pathname" text;
ALTER TABLE "research" ADD COLUMN "image_alt" text DEFAULT '' NOT NULL;
ALTER TABLE "research" ADD COLUMN "associated_files" jsonb DEFAULT '[]'::jsonb NOT NULL;
