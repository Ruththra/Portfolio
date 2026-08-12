CREATE TABLE "research" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL, "subtitle" text DEFAULT '' NOT NULL,
  "slug" text NOT NULL, "abstract" text NOT NULL, "authors" text NOT NULL,
  "venue" text, "publication_url" text, "repository_url" text,
  "status" text DEFAULT 'in_progress' NOT NULL, "sort_order" integer NOT NULL,
  "tech_stack" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "research_slug_unique" ON "research" USING btree ("slug");
CREATE INDEX "research_sort_order_idx" ON "research" USING btree ("sort_order");
CREATE INDEX "research_status_idx" ON "research" USING btree ("status");
