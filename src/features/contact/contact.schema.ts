import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter at least 2 characters.").max(80),
  email: z.email("Please enter a valid email address.").max(160),
  subject: z.string().trim().min(3, "Please enter a subject.").max(120),
  message: z
    .string()
    .trim()
    .min(20, "Please write at least 20 characters.")
    .max(3000),
  website: z.string().max(0, "Spam detected."),
  startedAt: z.number(),
  turnstileToken: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
