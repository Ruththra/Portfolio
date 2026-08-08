import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { ProjectFile, ProjectTechnology } from "@/db/schema";
import { technologyGroups } from "@/data/skills";
import { authorizeApi, sameOrigin } from "@/features/auth/api";
import { slugify } from "@/features/blog/blog.schema";
import {
  addProject,
  getProjectById,
  getProjectBySlug,
  listProjects,
  removeProject,
  reorderProject,
  updateProjectFiles,
} from "@/features/projects/project.repository";
import {
  deleteProjectFile,
  MAX_PROJECT_FILES,
  MAX_PROJECT_FILE_SIZE,
  MAX_PROJECT_IMAGE_SIZE,
  PROJECT_FILE_TYPES,
  PROJECT_IMAGE_TYPES,
  projectStorageConfigured,
  uploadProjectFile,
} from "@/features/projects/project.storage";

const statuses = new Set(["planned", "in_progress", "completed", "archived"]);
const MAX_TECHNOLOGIES = 20;
const technologyCatalog = new Map(
  technologyGroups.flatMap((group) =>
    group.technologies.map(
      (technology) => [technology.id, technology] as const,
    ),
  ),
);
const imageTypes = new Set<string>(PROJECT_IMAGE_TYPES);
const fileTypes = new Set<string>(PROJECT_FILE_TYPES);

function optionalUrl(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  try {
    const url = new URL(text);
    return url.protocol === "https:" || url.protocol === "http:" ? text : null;
  } catch {
    return null;
  }
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function GET() {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  return NextResponse.json(await listProjects());
}

export async function POST(request: Request) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  if (!sameOrigin(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  if (!projectStorageConfigured())
    return NextResponse.json(
      { message: "Project file storage is not configured." },
      { status: 503 },
    );

  const form = await request.formData();
  const title = String(form.get("title") ?? "").trim();
  const slug = slugify(title);
  const description = String(form.get("description") ?? "").trim();
  const imageAlt = String(form.get("imageAlt") ?? "").trim();
  const status = String(form.get("status") ?? "in_progress");
  const requestedOrder = Number(form.get("sortOrder"));
  const githubInput = form.get("githubUrl");
  const linkedinInput = form.get("linkedinUrl");
  const liveInput = form.get("liveUrl");
  const githubUrl = optionalUrl(githubInput);
  const linkedinUrl = optionalUrl(linkedinInput);
  const liveUrl = optionalUrl(liveInput);
  const image = form.get("image");
  const files = form
    .getAll("files")
    .filter((item): item is File => item instanceof File && item.size > 0);
  const fileVisibility = form
    .getAll("fileVisibility")
    .map((item) => String(item));
  const techIds = form.getAll("techId").map((item) => String(item));

  if (title.length < 2 || title.length > 120 || !slug)
    return NextResponse.json(
      { message: "Enter a project title between 2 and 120 characters." },
      { status: 400 },
    );
  if (description.length < 10 || description.length > 5000)
    return NextResponse.json(
      { message: "Enter a description between 10 and 5,000 characters." },
      { status: 400 },
    );
  if (!imageAlt || imageAlt.length > 240)
    return NextResponse.json(
      { message: "Provide concise alternative text for the project image." },
      { status: 400 },
    );
  if (!statuses.has(status) || !Number.isInteger(requestedOrder))
    return NextResponse.json(
      { message: "Choose a valid status and whole-number display order." },
      { status: 400 },
    );
  if (
    (githubInput && !githubUrl) ||
    (linkedinInput && !linkedinUrl) ||
    (liveInput && !liveUrl)
  )
    return NextResponse.json(
      {
        message:
          "GitHub, LinkedIn, and live-site links must be valid HTTP(S) URLs.",
      },
      { status: 400 },
    );
  if (
    !(image instanceof File) ||
    image.size === 0 ||
    image.size > MAX_PROJECT_IMAGE_SIZE ||
    !imageTypes.has(image.type)
  )
    return NextResponse.json(
      { message: "Choose a JPEG, PNG, WebP, or AVIF image under 5 MB." },
      { status: 400 },
    );
  if (
    files.length > MAX_PROJECT_FILES ||
    files.length !== fileVisibility.length ||
    fileVisibility.some((value) => value !== "public" && value !== "private") ||
    files.some(
      (file) => file.size > MAX_PROJECT_FILE_SIZE || !fileTypes.has(file.type),
    )
  )
    return NextResponse.json(
      {
        message:
          "Attach up to 8 PDF, ZIP, JSON, text, CSV, or Microsoft Office files, each under 10 MB.",
      },
      { status: 400 },
    );
  if (
    techIds.length > MAX_TECHNOLOGIES ||
    new Set(techIds).size !== techIds.length ||
    techIds.some((id) => !technologyCatalog.has(id))
  )
    return NextResponse.json(
      {
        message:
          "Choose up to 20 unique technologies from the available stack.",
      },
      { status: 400 },
    );
  if (await getProjectBySlug(slug))
    return NextResponse.json(
      { message: "A project with this title already exists." },
      { status: 409 },
    );

  const uploaded: Array<{ url: string; pathname: string }> = [];
  try {
    const imageUpload = await uploadProjectFile(
      `${crypto.randomUUID()}-${safeFileName(image.name)}`,
      image,
    );
    uploaded.push(imageUpload);
    const associatedFiles: ProjectFile[] = [];
    for (const file of files) {
      const stored = await uploadProjectFile(
        `${crypto.randomUUID()}-${safeFileName(file.name)}`,
        file,
      );
      uploaded.push(stored);
      associatedFiles.push({
        name: file.name,
        url: stored.url,
        pathname: stored.pathname,
        mimeType: file.type,
        size: String(file.size),
        isPublic: fileVisibility[associatedFiles.length] !== "private",
      });
    }
    const techStack: ProjectTechnology[] = [];
    for (const id of techIds) {
      const technology = technologyCatalog.get(id);
      if (!technology) continue;
      techStack.push({
        id,
        name: technology.name,
      });
    }
    const project = await addProject({
      title,
      slug,
      description,
      imageUrl: imageUpload.url,
      imagePathname: imageUpload.pathname,
      imageAlt,
      githubUrl,
      linkedinUrl,
      liveUrl,
      status,
      sortOrder: requestedOrder,
      associatedFiles,
      techStack,
    });
    revalidatePath("/", "layout");
    return NextResponse.json(
      { data: project, message: "Project uploaded successfully." },
      { status: 201 },
    );
  } catch (error) {
    await Promise.allSettled(
      uploaded.map((file) => deleteProjectFile(file.url, file.pathname)),
    );
    throw error;
  }
}

export async function PATCH(request: Request) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  if (!sameOrigin(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const body = (await request.json().catch(() => null)) as {
    action?: unknown;
    id?: unknown;
    isPublic?: unknown;
    pathname?: unknown;
    sortOrder?: unknown;
  } | null;
  const id = typeof body?.id === "string" ? body.id : "";

  if (body?.action === "file_visibility") {
    const pathname = typeof body.pathname === "string" ? body.pathname : "";
    if (!id || !pathname || typeof body.isPublic !== "boolean")
      return NextResponse.json(
        { message: "Provide a project file and visibility." },
        { status: 400 },
      );
    const current = await getProjectById(id);
    if (!current)
      return NextResponse.json(
        { message: "Project not found." },
        { status: 404 },
      );
    if (!current.associatedFiles.some((file) => file.pathname === pathname))
      return NextResponse.json(
        { message: "Associated file not found." },
        { status: 404 },
      );
    const project = await updateProjectFiles(
      id,
      current.associatedFiles.map((file) =>
        file.pathname === pathname
          ? { ...file, isPublic: body.isPublic as boolean }
          : file,
      ),
    );
    revalidatePath("/", "layout");
    return NextResponse.json({
      data: project,
      message: `Document is now ${body.isPublic ? "public" : "private"}.`,
    });
  }

  const sortOrder = Number(body?.sortOrder);
  if (!id || !Number.isInteger(sortOrder))
    return NextResponse.json(
      { message: "Provide a project and whole-number display order." },
      { status: 400 },
    );
  const project = await reorderProject(id, sortOrder);
  if (!project)
    return NextResponse.json(
      { message: "Project not found." },
      { status: 404 },
    );
  revalidatePath("/", "layout");
  return NextResponse.json({
    data: project,
    message: "Project order updated successfully.",
  });
}

export async function DELETE(request: Request) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  if (!sameOrigin(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const id = new URL(request.url).searchParams.get("id") ?? "";
  const project = await getProjectById(id);
  if (!project)
    return NextResponse.json(
      { message: "Project not found." },
      { status: 404 },
    );
  await Promise.all([
    deleteProjectFile(project.imageUrl, project.imagePathname),
    ...project.associatedFiles.map((file) =>
      deleteProjectFile(file.url, file.pathname),
    ),
    ...project.techStack.flatMap((technology) =>
      technology.iconUrl && technology.iconPathname
        ? [deleteProjectFile(technology.iconUrl, technology.iconPathname)]
        : [],
    ),
  ]);
  await removeProject(id);
  revalidatePath("/", "layout");
  return NextResponse.json({ message: "Project deleted successfully." });
}
