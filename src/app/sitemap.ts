import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { projects } from "@/features/projects/projects.data";
import { listPublishedPosts } from "@/features/blog/blog.repository";
import { getPortfolioContent } from "@/features/content/content.repository";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!siteConfig.siteUrl) return [];
  const content = await getPortfolioContent();
  const publishedBlogs = await listPublishedPosts();
  const paths = [
    "",
    "/privacy",
    ...(content.showProjects
      ? ["/projects", ...projects.map((p) => `/projects/${p.slug}`)]
      : []),
    ...(content.showBlog
      ? ["/blogs", ...publishedBlogs.map((p) => `/blogs/${p.slug}`)]
      : []),
  ];
  return paths.map((path) => ({
    url: `${siteConfig.siteUrl}${path}`,
    lastModified: new Date(),
  }));
}
