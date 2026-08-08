import "server-only";

import { and, asc, eq, gt, gte, lt, lte, ne, sql } from "drizzle-orm";
import { db, requireDb } from "@/db";
import {
  projects,
  type ProjectFile,
  type ProjectTechnology,
} from "@/db/schema";

export function listProjects() {
  return requireDb()
    .select()
    .from(projects)
    .orderBy(asc(projects.sortOrder), asc(projects.createdAt));
}

export async function listPublicProjects() {
  if (!db) return [];
  try {
    return await db
      .select()
      .from(projects)
      .where(ne(projects.status, "archived"))
      .orderBy(asc(projects.sortOrder), asc(projects.createdAt));
  } catch {
    return [];
  }
}

export async function getPublicProjectBySlug(slug: string) {
  if (!db) return undefined;
  try {
    return (
      await db
        .select()
        .from(projects)
        .where(and(eq(projects.slug, slug), ne(projects.status, "archived")))
        .limit(1)
    )[0];
  } catch {
    return undefined;
  }
}

export async function getProjectById(id: string) {
  return (
    await requireDb()
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1)
  )[0];
}

export async function getProjectBySlug(slug: string) {
  return (
    await requireDb()
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1)
  )[0];
}

export async function addProject(input: {
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  imagePathname: string;
  imageAlt: string;
  githubUrl: string | null;
  linkedinUrl: string | null;
  liveUrl: string | null;
  status: string;
  sortOrder: number;
  associatedFiles: ProjectFile[];
  techStack: ProjectTechnology[];
}) {
  return requireDb().transaction(async (transaction) => {
    const rows = await transaction.select({ id: projects.id }).from(projects);
    const order = Math.max(1, Math.min(input.sortOrder, rows.length + 1));
    await transaction
      .update(projects)
      .set({ sortOrder: sql`${projects.sortOrder} + 1` })
      .where(gte(projects.sortOrder, order));
    return (
      await transaction
        .insert(projects)
        .values({ ...input, sortOrder: order })
        .returning()
    )[0];
  });
}

export async function reorderProject(id: string, requestedOrder: number) {
  return requireDb().transaction(async (transaction) => {
    const current = (
      await transaction
        .select()
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1)
    )[0];
    if (!current) return undefined;
    const rows = await transaction.select({ id: projects.id }).from(projects);
    const nextOrder = Math.max(1, Math.min(requestedOrder, rows.length));
    if (nextOrder < current.sortOrder) {
      await transaction
        .update(projects)
        .set({ sortOrder: sql`${projects.sortOrder} + 1` })
        .where(
          and(
            gte(projects.sortOrder, nextOrder),
            lt(projects.sortOrder, current.sortOrder),
          ),
        );
    } else if (nextOrder > current.sortOrder) {
      await transaction
        .update(projects)
        .set({ sortOrder: sql`${projects.sortOrder} - 1` })
        .where(
          and(
            gt(projects.sortOrder, current.sortOrder),
            lte(projects.sortOrder, nextOrder),
          ),
        );
    }
    return (
      await transaction
        .update(projects)
        .set({ sortOrder: nextOrder, updatedAt: new Date() })
        .where(eq(projects.id, id))
        .returning()
    )[0];
  });
}

export async function updateProjectFiles(id: string, files: ProjectFile[]) {
  return (
    await requireDb()
      .update(projects)
      .set({ associatedFiles: files, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning()
  )[0];
}

export async function removeProject(id: string) {
  return requireDb().transaction(async (transaction) => {
    const removed = (
      await transaction.delete(projects).where(eq(projects.id, id)).returning()
    )[0];
    if (removed) {
      await transaction
        .update(projects)
        .set({ sortOrder: sql`${projects.sortOrder} - 1` })
        .where(gt(projects.sortOrder, removed.sortOrder));
    }
    return removed;
  });
}
