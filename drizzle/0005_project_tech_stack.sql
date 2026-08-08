ALTER TABLE "projects" ADD COLUMN "tech_stack" jsonb DEFAULT '[]'::jsonb NOT NULL;
