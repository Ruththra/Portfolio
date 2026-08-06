import { z } from "zod";

const optionalUrl = z
  .union([z.literal(""), z.string().url()])
  .transform((v) => v || null);
export const blogInputSchema = z
  .object({
    title: z.string().trim().min(3).max(160),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(180),
    excerpt: z.string().trim().min(10).max(400),
    content: z.string().trim().min(1).max(100_000),
    coverImage: optionalUrl,
    coverImageAlt: z.string().trim().max(240).default(""),
    authorName: z.string().trim().min(2).max(100),
    category: z.string().trim().min(2).max(80),
    tags: z.array(z.string().trim().min(1).max(40)).max(12),
    status: z.enum(["draft", "published"]),
    featured: z.boolean(),
    seoTitle: z.string().trim().max(70).default(""),
    seoDescription: z.string().trim().max(170).default(""),
    canonicalUrl: optionalUrl,
    socialImage: optionalUrl,
  })
  .superRefine((value, context) => {
    if (value.coverImage && !value.coverImageAlt)
      context.addIssue({
        code: "custom",
        path: ["coverImageAlt"],
        message: "Alternative text is required for a cover image.",
      });
  });
export type BlogInput = z.infer<typeof blogInputSchema>;

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
