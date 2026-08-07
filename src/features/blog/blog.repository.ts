import "server-only";
import { and, desc, eq, ne } from "drizzle-orm";
import { db, requireDb } from "@/db";
import { blogPosts } from "@/db/schema";
import type { BlogInput } from "./blog.schema";

export async function listPublishedPosts() {
  if (!db) return [];
  return db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.status, "published"))
    .orderBy(desc(blogPosts.publishedAt));
}
export async function getPublishedPost(slug: string) {
  if (!db) return undefined;
  return (
    await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")))
      .limit(1)
  )[0];
}
export async function listAllPosts() {
  return requireDb()
    .select()
    .from(blogPosts)
    .orderBy(desc(blogPosts.updatedAt));
}
export async function getPost(id: string) {
  return (
    await requireDb()
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id))
      .limit(1)
  )[0];
}
export async function slugExists(slug: string, exceptId?: string) {
  const where = exceptId
    ? and(eq(blogPosts.slug, slug), ne(blogPosts.id, exceptId))
    : eq(blogPosts.slug, slug);
  return (
    (
      await requireDb()
        .select({ id: blogPosts.id })
        .from(blogPosts)
        .where(where)
        .limit(1)
    ).length > 0
  );
}
export async function createPost(input: BlogInput) {
  const now = new Date();
  return (
    await requireDb()
      .insert(blogPosts)
      .values({
        ...input,
        publishedAt: input.status === "published" ? now : null,
      })
      .returning()
  )[0];
}
export async function updatePost(id: string, input: BlogInput) {
  const old = await getPost(id);
  if (!old) return undefined;
  return (
    await requireDb()
      .update(blogPosts)
      .set({
        ...input,
        updatedAt: new Date(),
        publishedAt:
          input.status === "published" ? (old.publishedAt ?? new Date()) : null,
      })
      .where(eq(blogPosts.id, id))
      .returning()
  )[0];
}
export async function deletePost(id: string) {
  return requireDb().delete(blogPosts).where(eq(blogPosts.id, id));
}
