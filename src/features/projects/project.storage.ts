import "server-only";

import { del, put } from "@vercel/blob";
import { createClient } from "@supabase/supabase-js";

const PROJECT_BUCKET = process.env.SUPABASE_PROJECT_BUCKET || "projects";
const MAX_PROJECT_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_PROJECT_FILE_SIZE = 10 * 1024 * 1024;
const MAX_PROJECT_FILES = 8;
const PROJECT_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;
const PROJECT_FILE_TYPES = [
  "application/pdf",
  "application/zip",
  "application/json",
  "text/plain",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

function supabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function projectStorageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN) || supabaseConfigured();
}

function getStorage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Project storage is not configured.");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  }).storage;
}

async function ensureBucket() {
  const storage = getStorage();
  const existing = await storage.getBucket(PROJECT_BUCKET);
  if (existing.data) return storage;
  if (existing.error && !/not found/i.test(existing.error.message)) {
    throw existing.error;
  }
  const created = await storage.createBucket(PROJECT_BUCKET, {
    public: true,
    allowedMimeTypes: [...PROJECT_IMAGE_TYPES, ...PROJECT_FILE_TYPES],
    fileSizeLimit: MAX_PROJECT_FILE_SIZE,
  });
  if (created.error && !/already exists/i.test(created.error.message)) {
    throw created.error;
  }
  return storage;
}

export async function uploadProjectFile(pathname: string, file: File) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`portfolio/projects/${pathname}`, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return { url: blob.url, pathname: blob.pathname };
  }
  const storage = await ensureBucket();
  const uploaded = await storage.from(PROJECT_BUCKET).upload(pathname, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (uploaded.error) throw uploaded.error;
  return {
    url: storage.from(PROJECT_BUCKET).getPublicUrl(uploaded.data.path).data
      .publicUrl,
    pathname: uploaded.data.path,
  };
}

export async function deleteProjectFile(url: string, pathname: string) {
  if (url.includes(".blob.vercel-storage.com")) {
    await del(url);
    return;
  }
  const result = await getStorage().from(PROJECT_BUCKET).remove([pathname]);
  if (result.error) throw result.error;
}

export {
  MAX_PROJECT_FILES,
  MAX_PROJECT_FILE_SIZE,
  MAX_PROJECT_IMAGE_SIZE,
  PROJECT_FILE_TYPES,
  PROJECT_IMAGE_TYPES,
};
