import "server-only";

import { createClient } from "@supabase/supabase-js";

const RESUME_BUCKET = process.env.SUPABASE_RESUME_BUCKET || "resumes";
const MAX_RESUME_SIZE = 10 * 1024 * 1024;

export function resumeStorageConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function getResumeStorage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase résumé storage is not configured.");
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  }).storage;
}

async function ensureResumeBucket() {
  const storage = getResumeStorage();
  const { data, error } = await storage.getBucket(RESUME_BUCKET);
  if (data) return storage;
  if (error && !/not found/i.test(error.message)) throw error;

  const created = await storage.createBucket(RESUME_BUCKET, {
    public: false,
    allowedMimeTypes: ["application/pdf"],
    fileSizeLimit: MAX_RESUME_SIZE,
  });
  if (created.error && !/already exists/i.test(created.error.message)) {
    throw created.error;
  }
  return storage;
}

export async function uploadResumeFile(path: string, file: File) {
  const storage = await ensureResumeBucket();
  const result = await storage.from(RESUME_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: "application/pdf",
    upsert: false,
  });
  if (result.error) throw result.error;
}

export async function deleteResumeFile(path: string) {
  const result = await getResumeStorage().from(RESUME_BUCKET).remove([path]);
  if (result.error) throw result.error;
}

export async function createResumeDownloadUrl(path: string, fileName: string) {
  const result = await getResumeStorage()
    .from(RESUME_BUCKET)
    .createSignedUrl(path, 60, { download: fileName });
  if (result.error) throw result.error;
  return result.data.signedUrl;
}

export async function createResumeViewUrl(path: string) {
  const result = await getResumeStorage()
    .from(RESUME_BUCKET)
    .createSignedUrl(path, 60);
  if (result.error) throw result.error;
  return result.data.signedUrl;
}

export { MAX_RESUME_SIZE };
