import type { ContactInput } from "@/features/contact/contact.schema";

export type ContactFieldErrors = Partial<Record<keyof ContactInput, string[]>>;

export type ContactResponse =
  | { success: true; message: string; development?: true }
  | { success: false; message: string; fieldErrors?: ContactFieldErrors };
