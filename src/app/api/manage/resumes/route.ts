import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { authorizeApi, sameOrigin } from "@/features/auth/api";
import {
  addResume,
  getResume,
  listResumes,
  renameResume,
  removeResume,
  selectResume,
} from "@/features/resume/resume.repository";
import {
  deleteResumeFile,
  createResumeViewUrl,
  MAX_RESUME_SIZE,
  resumeStorageConfigured,
  uploadResumeFile,
} from "@/features/resume/resume.storage";

export async function GET(request: Request) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;

  const viewId = new URL(request.url).searchParams.get("view");
  if (viewId) {
    if (!resumeStorageConfigured())
      return NextResponse.json(
        { message: "Supabase résumé storage is not configured." },
        { status: 503 },
      );
    const resume = await getResume(viewId);
    if (!resume)
      return NextResponse.json(
        { message: "Résumé not found." },
        { status: 404 },
      );
    return NextResponse.redirect(await createResumeViewUrl(resume.storagePath));
  }

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
  const requestedName = String(form.get("fileName") ?? "").trim();
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

  const fileName = requestedName
    ? `${requestedName.replace(/\.pdf$/i, "").trim()}.pdf`
    : file.name;
  if (
    fileName.length > 180 ||
    fileName === ".pdf" ||
    /[\\/\0-\x1f]/.test(fileName)
  ) {
    return NextResponse.json(
      {
        message:
          "Enter a valid file name containing no more than 176 characters.",
      },
      { status: 400 },
    );
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  const storagePath = `${crypto.randomUUID()}-${safeName}`;
  await uploadResumeFile(storagePath, file);
  try {
    const resume = await addResume({
      fileName,
      storagePath,
      mimeType: file.type,
      size: String(file.size),
    });
    revalidatePath("/", "layout");
    return NextResponse.json(
      { data: resume, message: "Resume uploaded successfully." },
      { status: 201 },
    );
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
  const body = (await request.json()) as {
    action?: unknown;
    fileName?: unknown;
    id?: unknown;
  };
  const id = String(body.id ?? "");

  if (body.action === "rename") {
    const requestedName = String(body.fileName ?? "").trim();
    const fileName = `${requestedName.replace(/\.pdf$/i, "").trim()}.pdf`;
    if (
      fileName.length > 180 ||
      fileName === ".pdf" ||
      /[\\/\0-\x1f]/.test(fileName)
    ) {
      return NextResponse.json(
        {
          message:
            "Enter a valid file name containing no more than 176 characters.",
        },
        { status: 400 },
      );
    }
    const renamed = await renameResume(id, fileName);
    if (!renamed)
      return NextResponse.json(
        { message: "Résumé not found." },
        { status: 404 },
      );
    revalidatePath("/", "layout");
    return NextResponse.json({
      data: renamed,
      message: "Resume renamed successfully.",
    });
  }

  const selected = await selectResume(id);
  if (!selected)
    return NextResponse.json({ message: "Résumé not found." }, { status: 404 });
  revalidatePath("/", "layout");
  return NextResponse.json({
    data: selected,
    message: "Public resume updated successfully.",
  });
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
  return NextResponse.json({ message: "Resume deleted successfully." });
}
