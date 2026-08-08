import { desc } from "drizzle-orm";
import { requireDb } from "@/db";
import { media } from "@/db/schema";
import { MediaManager } from "@/components/manage/MediaManager";
import { mediaStorageConfigured } from "@/features/avatar/media.storage";
export default async function MediaPage() {
  const items = await requireDb()
    .select()
    .from(media)
    .orderBy(desc(media.createdAt));
  return (
    <>
      <header className="manage-header">
        <div>
          <p className="eyebrow">ASSETS</p>
          <h1>Media &amp; avatar</h1>
          <p>
            Upload images, maintain accessible metadata, and select the homepage
            avatar.
          </p>
        </div>
      </header>
      <MediaManager initial={items} configured={mediaStorageConfigured()} />
    </>
  );
}
