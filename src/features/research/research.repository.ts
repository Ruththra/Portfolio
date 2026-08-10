import "server-only";

import { asc, eq, ne } from "drizzle-orm";
import { requireDb } from "@/db";
import {
  research,
  type ProjectFile,
  type ProjectTechnology,
} from "@/db/schema";

export function listResearch() {
  return requireDb().select().from(research).orderBy(asc(research.sortOrder));
}
export function listPublicResearch() {
  return requireDb()
    .select()
    .from(research)
    .where(ne(research.status, "archived"))
    .orderBy(asc(research.sortOrder));
}
export async function getResearchBySlug(slug: string) {
  return (
    await requireDb()
      .select()
      .from(research)
      .where(eq(research.slug, slug))
      .limit(1)
  )[0];
}
export async function getResearchById(id: string) {
  return (
    await requireDb()
      .select()
      .from(research)
      .where(eq(research.id, id))
      .limit(1)
  )[0];
}
export async function saveResearch(input: {
  id?: string;
  title: string;
  subtitle: string;
  slug: string;
  abstract: string;
  authors: string;
  venue: string | null;
  publicationUrl: string | null;
  repositoryUrl: string | null;
  status: string;
  sortOrder: number;
  techStack: ProjectTechnology[];
}) {
  const { id, ...values } = input;
  if (id)
    return (
      await requireDb()
        .update(research)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(research.id, id))
        .returning()
    )[0];
  return (await requireDb().insert(research).values(values).returning())[0];
}
export async function deleteResearch(id: string) {
  return (
    await requireDb().delete(research).where(eq(research.id, id)).returning()
  )[0];
}
export async function updateResearchAssets(
  id: string,
  values: {
    imageUrl?: string | null;
    imagePathname?: string | null;
    imageAlt?: string;
    associatedFiles?: ProjectFile[];
  },
) {
  return (
    await requireDb()
      .update(research)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(research.id, id))
      .returning()
  )[0];
}
