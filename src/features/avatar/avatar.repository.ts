import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { avatarAssets } from "./avatar.config";

export type AvatarImage = {
  url: string;
  alt: string;
};

export async function getSelectedAvatar(): Promise<AvatarImage> {
  if (!db) return { url: avatarAssets.portrait, alt: avatarAssets.alt };

  try {
    const selected = (
      await db
        .select({ url: media.url, alt: media.alt })
        .from(media)
        .where(eq(media.selectedAvatar, true))
        .limit(1)
    )[0];

    return selected ?? { url: avatarAssets.portrait, alt: avatarAssets.alt };
  } catch {
    return { url: avatarAssets.portrait, alt: avatarAssets.alt };
  }
}
