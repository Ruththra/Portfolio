import "server-only";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { db, requireDb } from "@/db";
import { portfolioContent } from "@/db/schema";
import { siteConfig } from "@/config/site";
import type { PortfolioContent } from "./content.schema";

const previousDefaultAboutText =
  "I am a Computer Science and Engineering undergraduate at the University of Moratuwa, specializing in Data Science and Engineering. I am also a Full-Stack Developer who enjoys building scalable web and mobile applications using modern technologies.\n\nI am fascinated by how software, data, machine learning, deep learning, computer vision, and intelligent systems can solve real-world problems.";

export const defaultContent: PortfolioContent = {
  heroHeading: siteConfig.fullName,
  heroIntroduction:
    "As I like to be unique, I built this creative portfolio block by block with my own idea bits.",
  heroRoles: [
    "Full-Stack Developer",
    "Creative Designer",
    "Passionate Learner",
  ],
  aboutText:
    "I am a Computer Science and Engineering undergraduate at the University of Moratuwa, specializing in Data Science and Engineering. As a full-stack developer, I enjoy designing and building scalable web and mobile applications that combine reliable software engineering with intelligent, data-driven capabilities.\n\nMy experience spans full-stack development, machine learning, multilingual natural language processing, predictive maintenance, RAG systems, and AI-assisted applications.\n\nI am particularly fascinated by the potential of software, data science, machine learning, deep learning, computer vision, and intelligent systems to address meaningful real-world challenges. I am always eager to learn, experiment with emerging technologies, and build solutions that create a measurable impact.",
  email: siteConfig.email,
  location: siteConfig.location,
  linkedin: siteConfig.socials.linkedin,
  github: siteConfig.socials.github,
  instagram: siteConfig.socials.instagram,
  showRemoteAvailability: true,
  showBlog: true,
  showProjects: true,
  showResearch: true,
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
      if (!row) return defaultContent;

      const savedContent = row.value as Partial<PortfolioContent>;
      const isUneditedPreviousDefault =
        savedContent.aboutText === previousDefaultAboutText;

      return {
        ...defaultContent,
        ...savedContent,
        aboutText: isUneditedPreviousDefault
          ? defaultContent.aboutText
          : (savedContent.aboutText ?? defaultContent.aboutText),
      };
    } catch {
      return defaultContent;
    }
  },
);
export async function savePortfolioVisibility(
  visibility: Pick<
    PortfolioContent,
    "showBlog" | "showProjects" | "showResearch"
  >,
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
