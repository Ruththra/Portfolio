import { z } from "zod";
export const portfolioContentSchema = z.object({
  heroHeading: z.string().trim().min(2).max(120),
  heroIntroduction: z.string().trim().min(10).max(500),
  aboutText: z.string().trim().min(20).max(5000),
  email: z.union([z.literal(""), z.string().email()]),
  location: z.string().trim().max(120),
  resumeUrl: z.union([
    z.literal(""),
    z.string().url(),
    z.string().startsWith("/"),
  ]),
  linkedin: z.union([z.literal(""), z.string().url()]),
  github: z.union([z.literal(""), z.string().url()]),
  instagram: z.union([z.literal(""), z.string().url()]),
  showBlog: z.boolean(),
  seoDescription: z.string().trim().min(20).max(170),
});
export type PortfolioContent = z.infer<typeof portfolioContentSchema>;
