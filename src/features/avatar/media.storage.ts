import "server-only";

import { del, put } from "@vercel/blob";
import { createClient } from "@supabase/supabase-js";

const MEDIA_BUCKET = process.env.SUPABASE_MEDIA_BUCKET || "media";
const MAX_MEDIA_SIZE = 5 * 1024 * 1024;
const ALLOWED_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

function supabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function mediaStorageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN) || supabaseConfigured();
}

function getSupabaseStorage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Media storage is not configured.");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  }).storage;
}

async function ensureMediaBucket() {
  const storage = getSupabaseStorage();
  const existing = await storage.getBucket(MEDIA_BUCKET);
  if (existing.data) return storage;
  if (existing.error && !/not found/i.test(existing.error.message)) {
    throw existing.error;
  }

  const created = await storage.createBucket(MEDIA_BUCKET, {
    public: true,
    allowedMimeTypes: ALLOWED_MEDIA_TYPES,
    fileSizeLimit: MAX_MEDIA_SIZE,
  });
  if (created.error && !/already exists/i.test(created.error.message)) {
    throw created.error;
  }
  return storage;
}

export async function uploadMediaFile(path: string, file: File) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`portfolio/${path}`, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return { url: blob.url, pathname: blob.pathname };
  }

  const storage = await ensureMediaBucket();
  const uploaded = await storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (uploaded.error) throw uploaded.error;
  const publicUrl = storage.from(MEDIA_BUCKET).getPublicUrl(uploaded.data.path);
  return { url: publicUrl.data.publicUrl, pathname: uploaded.data.path };
}

export async function deleteMediaFile(url: string, pathname: string) {
  if (url.includes(".blob.vercel-storage.com")) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("Vercel Blob is required to delete this older item.");
    }
    await del(url);
    return;
  }

  const removed = await getSupabaseStorage()
    .from(MEDIA_BUCKET)
    .remove([pathname]);
  if (removed.error) throw removed.error;
}

export { ALLOWED_MEDIA_TYPES, MAX_MEDIA_SIZE };
