CREATE TABLE "projects" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "slug" text NOT NULL,
  "description" text NOT NULL,
  "image_url" text NOT NULL,
  "image_pathname" text NOT NULL,
  "image_alt" text NOT NULL,
  "github_url" text,
  "live_url" text,
  "status" text DEFAULT 'in_progress' NOT NULL,
  "sort_order" integer NOT NULL,
  "associated_files" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "projects_slug_unique" ON "projects" USING btree ("slug");
CREATE INDEX "projects_sort_order_idx" ON "projects" USING btree ("sort_order");
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");
