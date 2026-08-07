import { z } from "zod";

const externalUrl = z
  .string()
  .trim()
  .transform((value) =>
    value && !/^[a-z][a-z\d+.-]*:/i.test(value) ? `https://${value}` : value,
  )
  .pipe(
    z.union([
      z.literal(""),
      z
        .url()
        .refine(
          (value) => ["http:", "https:"].includes(new URL(value).protocol),
          {
            message: "Enter a valid HTTP or HTTPS URL.",
          },
        ),
    ]),
  );

export const portfolioContentSchema = z.object({
  heroHeading: z.string().trim().min(2).max(120),
  heroIntroduction: z.string().trim().min(10).max(500),
  aboutText: z.string().trim().min(20).max(5000),
  email: z.union([z.literal(""), z.string().email()]),
  location: z.string().trim().max(120),
  linkedin: externalUrl,
  github: externalUrl,
  instagram: externalUrl,
  showRemoteAvailability: z.boolean(),
  showBlog: z.boolean(),
  showProjects: z.boolean(),
  seoDescription: z.string().trim().min(20).max(170),
});
export const portfolioVisibilitySchema = portfolioContentSchema.pick({
  showBlog: true,
  showProjects: true,
});
export type PortfolioContent = z.infer<typeof portfolioContentSchema>;
