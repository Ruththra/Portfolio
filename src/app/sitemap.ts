import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { projects } from "@/features/projects/projects.data";
import { publishedBlogs } from "@/features/blog/blog.data";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteConfig.siteUrl) return [];
  const paths = [
    "",
    "/projects",
    "/blogs",
    "/privacy",
    ...projects.map((p) => `/projects/${p.slug}`),
    ...publishedBlogs.map((p) => `/blogs/${p.slug}`),
  ];
  return paths.map((path) => ({
    url: `${siteConfig.siteUrl}${path}`,
    lastModified: new Date(),
  }));
}
