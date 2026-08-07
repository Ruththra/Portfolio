import "server-only";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { db, requireDb } from "@/db";
import { portfolioContent } from "@/db/schema";
import { siteConfig } from "@/config/site";
import type { PortfolioContent } from "./content.schema";
export const defaultContent: PortfolioContent = {
  heroHeading: siteConfig.fullName,
  heroIntroduction:
    "As I like to be unique, I built this creative portfolio block by block with my own idea bits.",
  aboutText:
    "I am a Computer Science and Engineering undergraduate at the University of Moratuwa, specializing in Data Science and Engineering. I am also a Full-Stack Developer who enjoys building scalable web and mobile applications using modern technologies.\n\nI am fascinated by how software, data, machine learning, deep learning, computer vision, and intelligent systems can solve real-world problems.",
  email: siteConfig.email,
  location: siteConfig.location,
  linkedin: siteConfig.socials.linkedin,
  github: siteConfig.socials.github,
  instagram: siteConfig.socials.instagram,
  showBlog: true,
  showProjects: true,
  seoDescription: siteConfig.seoDescription,
};
export const getPortfolioContent = cache(
  async (): Promise<PortfolioContent> => {
    if (!db) return defaultContent;
    try {
      const row = (
        await db
          .select()
          .from(portfolioContent)
          .where(eq(portfolioContent.key, "homepage"))
          .limit(1)
      )[0];
      return row
        ? { ...defaultContent, ...(row.value as Partial<PortfolioContent>) }
        : defaultContent;
    } catch {
      return defaultContent;
    }
  },
);
export async function savePortfolioVisibility(
  visibility: Pick<PortfolioContent, "showBlog" | "showProjects">,
) {
  const current = await getPortfolioContent();
  return savePortfolioContent({ ...current, ...visibility });
}
export async function savePortfolioContent(value: PortfolioContent) {
  await requireDb()
    .insert(portfolioContent)
    .values({ key: "homepage", value })
    .onConflictDoUpdate({
      target: portfolioContent.key,
      set: { value, updatedAt: new Date() },
    });
  return value;
}
