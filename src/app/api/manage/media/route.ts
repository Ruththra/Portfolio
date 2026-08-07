import { del, put } from "@vercel/blob";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireDb } from "@/db";
import { media } from "@/db/schema";
import { authorizeApi, sameOrigin } from "@/features/auth/api";
const allowed = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const MAX = 5 * 1024 * 1024;
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
  if (!process.env.BLOB_READ_WRITE_TOKEN)
    return NextResponse.json(
      {
        message: "Media storage is not configured. Add BLOB_READ_WRITE_TOKEN.",
      },
      { status: 503 },
    );
  const form = await request.formData();
  const file = form.get("file");
  const alt = String(form.get("alt") ?? "").trim();
  if (
    !(file instanceof File) ||
    !allowed.has(file.type) ||
    file.size > MAX ||
    !alt
  )
    return NextResponse.json(
      {
        message:
          "Choose a JPEG, PNG, WebP, or AVIF under 5 MB and provide alternative text.",
      },
      { status: 400 },
    );
  const blob = await put(
    `portfolio/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`,
    file,
    { access: "public", addRandomSuffix: false },
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
export async function DELETE(request: Request) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  if (!sameOrigin(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  if (!process.env.BLOB_READ_WRITE_TOKEN)
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
  await del(row.url);
  await requireDb().delete(media).where(eq(media.id, id));
  return new NextResponse(null, { status: 204 });
}
