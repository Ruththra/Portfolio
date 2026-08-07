import { desc } from "drizzle-orm";
import { requireDb } from "@/db";
import { media } from "@/db/schema";
import { MediaManager } from "@/components/manage/MediaManager";
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
          <h1>Media</h1>
          <p>Durable image uploads and accessible metadata.</p>
        </div>
      </header>
      <MediaManager
        initial={items}
        configured={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
      />
    </>
  );
}
