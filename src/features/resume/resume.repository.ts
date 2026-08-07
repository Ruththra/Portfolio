import "server-only";

import { desc, eq } from "drizzle-orm";
import { db, requireDb } from "@/db";
import { resumes } from "@/db/schema";

export async function listResumes() {
  return requireDb().select().from(resumes).orderBy(desc(resumes.createdAt));
}

export async function getResume(id: string) {
  return (
    await requireDb().select().from(resumes).where(eq(resumes.id, id)).limit(1)
  )[0];
}

export async function getSelectedResume() {
  if (!db) return undefined;
  try {
    return (
      await db.select().from(resumes).where(eq(resumes.selected, true)).limit(1)
    )[0];
  } catch {
    return undefined;
  }
}

export async function addResume(input: {
  fileName: string;
  storagePath: string;
  mimeType: string;
  size: string;
}) {
  return requireDb().transaction(async (transaction) => {
    const selected =
      (
        await transaction
          .select({ id: resumes.id })
          .from(resumes)
          .where(eq(resumes.selected, true))
          .limit(1)
      ).length === 0;
    return (
      await transaction
        .insert(resumes)
        .values({ ...input, selected })
        .returning()
    )[0];
  });
}

export async function selectResume(id: string) {
  return requireDb().transaction(async (transaction) => {
    const exists = (
      await transaction
        .select({ id: resumes.id })
        .from(resumes)
        .where(eq(resumes.id, id))
        .limit(1)
    )[0];
    if (!exists) return undefined;
    await transaction.update(resumes).set({ selected: false });
    return (
      await transaction
        .update(resumes)
        .set({ selected: true })
        .where(eq(resumes.id, id))
        .returning()
    )[0];
  });
}

export async function renameResume(id: string, fileName: string) {
  return (
    await requireDb()
      .update(resumes)
      .set({ fileName })
      .where(eq(resumes.id, id))
      .returning()
  )[0];
}

export async function removeResume(id: string) {
  return (
    await requireDb().delete(resumes).where(eq(resumes.id, id)).returning()
  )[0];
}
