CREATE TABLE "resumes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "file_name" text NOT NULL,
  "storage_path" text NOT NULL,
  "mime_type" text NOT NULL,
  "size" text NOT NULL,
  "selected" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "resumes_storage_path_unique" ON "resumes" ("storage_path");
CREATE UNIQUE INDEX "resumes_single_selected" ON "resumes" ("selected") WHERE "selected" = true;
