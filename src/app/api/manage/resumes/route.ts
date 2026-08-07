import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { authorizeApi, sameOrigin } from "@/features/auth/api";
import {
  addResume,
  getResume,
  listResumes,
  removeResume,
  selectResume,
} from "@/features/resume/resume.repository";
import {
  deleteResumeFile,
  MAX_RESUME_SIZE,
  resumeStorageConfigured,
  uploadResumeFile,
} from "@/features/resume/resume.storage";

export async function GET() {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  return NextResponse.json(await listResumes());
}

export async function POST(request: Request) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  if (!sameOrigin(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  if (!resumeStorageConfigured())
    return NextResponse.json(
      { message: "Supabase résumé storage is not configured." },
      { status: 503 },
    );

  const form = await request.formData();
  const file = form.get("file");
  if (
    !(file instanceof File) ||
    file.type !== "application/pdf" ||
    !file.name.toLowerCase().endsWith(".pdf") ||
    file.size === 0 ||
    file.size > MAX_RESUME_SIZE
  ) {
    return NextResponse.json(
      { message: "Choose a PDF file no larger than 10 MB." },
      { status: 400 },
    );
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const storagePath = `${crypto.randomUUID()}-${safeName}`;
  await uploadResumeFile(storagePath, file);
  try {
    const resume = await addResume({
      fileName: file.name,
      storagePath,
      mimeType: file.type,
      size: String(file.size),
    });
    revalidatePath("/", "layout");
    return NextResponse.json(resume, { status: 201 });
  } catch (error) {
    await deleteResumeFile(storagePath).catch(() => undefined);
    throw error;
  }
}

export async function PATCH(request: Request) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  if (!sameOrigin(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const id = String(((await request.json()) as { id?: unknown }).id ?? "");
  const selected = await selectResume(id);
  if (!selected)
    return NextResponse.json({ message: "Résumé not found." }, { status: 404 });
  revalidatePath("/", "layout");
  return NextResponse.json(selected);
}

export async function DELETE(request: Request) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  if (!sameOrigin(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  if (!resumeStorageConfigured())
    return NextResponse.json(
      { message: "Supabase résumé storage is not configured." },
      { status: 503 },
    );

  const id = new URL(request.url).searchParams.get("id") ?? "";
  const resume = await getResume(id);
  if (!resume)
    return NextResponse.json({ message: "Résumé not found." }, { status: 404 });
  await deleteResumeFile(resume.storagePath);
  await removeResume(resume.id);
  revalidatePath("/", "layout");
  return new NextResponse(null, { status: 204 });
}
