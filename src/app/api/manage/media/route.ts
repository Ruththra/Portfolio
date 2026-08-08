import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireDb } from "@/db";
import { media } from "@/db/schema";
import { authorizeApi, sameOrigin } from "@/features/auth/api";
import {
  ALLOWED_MEDIA_TYPES,
  deleteMediaFile,
  MAX_MEDIA_SIZE,
  mediaStorageConfigured,
  uploadMediaFile,
} from "@/features/avatar/media.storage";
const allowed = new Set(ALLOWED_MEDIA_TYPES);
export async function GET() {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  return NextResponse.json(
    await requireDb().select().from(media).orderBy(desc(media.createdAt)),
  );
}
export async function POST(request: Request) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  if (!sameOrigin(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  if (!mediaStorageConfigured())
    return NextResponse.json(
      {
        message: "Media storage is not configured.",
      },
      { status: 503 },
    );
  const form = await request.formData();
  const file = form.get("file");
  const alt = String(form.get("alt") ?? "").trim();
  if (
    !(file instanceof File) ||
    !allowed.has(file.type) ||
    file.size > MAX_MEDIA_SIZE ||
    !alt
  )
    return NextResponse.json(
      {
        message:
          "Choose a JPEG, PNG, WebP, or AVIF under 5 MB and provide alternative text.",
      },
      { status: 400 },
    );
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const blob = await uploadMediaFile(
    `${crypto.randomUUID()}-${safeName}`,
    file,
  );
  const row = (
    await requireDb()
      .insert(media)
      .values({
        url: blob.url,
        pathname: blob.pathname,
        alt,
        mimeType: file.type,
        size: String(file.size),
      })
      .returning()
  )[0];
  return NextResponse.json(row, { status: 201 });
}
export async function PATCH(request: Request) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  if (!sameOrigin(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const body = (await request.json().catch(() => null)) as {
    id?: unknown;
  } | null;
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id)
    return NextResponse.json({ message: "Missing media ID." }, { status: 400 });

  const database = requireDb();
  const row = (
    await database.select().from(media).where(eq(media.id, id)).limit(1)
  )[0];
  if (!row) return NextResponse.json({ message: "Not found" }, { status: 404 });

  await database.transaction(async (transaction) => {
    await transaction.update(media).set({ selectedAvatar: false });
    await transaction
      .update(media)
      .set({ selectedAvatar: true })
      .where(eq(media.id, id));
  });

  return NextResponse.json({ id, selectedAvatar: true });
}
export async function DELETE(request: Request) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  if (!sameOrigin(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  if (!mediaStorageConfigured())
    return NextResponse.json(
      { message: "Media storage is not configured." },
      { status: 503 },
    );
  const id = new URL(request.url).searchParams.get("id");
  if (!id)
    return NextResponse.json({ message: "Missing media ID." }, { status: 400 });
  const row = (
    await requireDb().select().from(media).where(eq(media.id, id)).limit(1)
  )[0];
  if (!row) return NextResponse.json({ message: "Not found" }, { status: 404 });
  if (row.selectedAvatar)
    return NextResponse.json(
      { message: "Select another avatar before deleting this image." },
      { status: 409 },
    );
  await deleteMediaFile(row.url, row.pathname);
  await requireDb().delete(media).where(eq(media.id, id));
  return new NextResponse(null, { status: 204 });
}
