import "server-only";

import { z } from "zod";

const optionalValue = z.preprocess(
  (value) => value || undefined,
  z.string().optional(),
);
const environmentSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    RESEND_API_KEY: optionalValue,
    CONTACT_TO_EMAIL: optionalValue,
    CONTACT_FROM_EMAIL: optionalValue,
    TURNSTILE_SECRET_KEY: optionalValue,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: optionalValue,
    DATABASE_URL: optionalValue,
    DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(10).optional(),
    BLOB_READ_WRITE_TOKEN: optionalValue,
    NEXT_PUBLIC_SUPABASE_URL: optionalValue,
    SUPABASE_SERVICE_ROLE_KEY: optionalValue,
    SUPABASE_RESUME_BUCKET: optionalValue,
    SUPABASE_MEDIA_BUCKET: optionalValue,
    ADMIN_SEED_EMAIL: optionalValue,
    ADMIN_SEED_PASSWORD: optionalValue,
  })
  .superRefine((environment, context) => {
    const emailValues = [
      environment.RESEND_API_KEY,
      environment.CONTACT_TO_EMAIL,
      environment.CONTACT_FROM_EMAIL,
    ];
    if (emailValues.some(Boolean) && !emailValues.every(Boolean)) {
      context.addIssue({
        code: "custom",
        message:
          "RESEND_API_KEY, CONTACT_TO_EMAIL, and CONTACT_FROM_EMAIL must be configured together.",
      });
    }
    if (
      Boolean(environment.TURNSTILE_SECRET_KEY) !==
      Boolean(environment.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
    ) {
      context.addIssue({
        code: "custom",
        message: "Turnstile site and secret keys must be configured together.",
      });
    }
  });

export type ServerEnvironment = z.infer<typeof environmentSchema>;

export function getServerEnvironment(): ServerEnvironment {
  return environmentSchema.parse(process.env);
}
