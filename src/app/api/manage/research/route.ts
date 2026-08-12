import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { authorizeApi, sameOrigin } from "@/features/auth/api";
import { slugify } from "@/features/blog/blog.schema";
import type { ProjectFile } from "@/db/schema";
import { technologyGroups, type Technology } from "@/data/skills";
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
import {
  deleteResearch,
  getResearchById,
  saveResearch,
  updateResearchAssets,
} from "@/features/research/research.repository";

const catalog = new Map(
  technologyGroups.flatMap((g) =>
    g.technologies.map((t) => [t.name.toLowerCase(), t] as const),
  ),
);
const catalogById = new Map<string, Technology>(
  technologyGroups.flatMap((group) =>
    group.technologies.map(
      (technology) => [technology.id, technology] as const,
    ),
  ),
);
function url(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  try {
    const parsed = new URL(text);
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? text
      : null;
  } catch {
    return null;
  }
}
function stack(csv: string, ids: string[] = []) {
  const found = new Map();
  for (const id of ids) {
    const known = catalogById.get(id);
    if (known) found.set(known.id, { id: known.id, name: known.name });
  }
  for (const raw of csv.split(",")) {
    const name = raw.trim();
    if (!name) continue;
    const known = catalog.get(name.toLowerCase());
    found.set(known?.id ?? `custom-${slugify(name)}`, {
      id: known?.id ?? `custom-${slugify(name)}`,
      name: known?.name ?? name.slice(0, 60),
    });
  }
  return [...found.values()].slice(0, 20);
}
function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function POST(request: Request) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  if (!sameOrigin(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const form = await request.formData();
  const title = String(form.get("title") ?? "").trim();
  const slug = slugify(title);
  const abstract = String(form.get("abstract") ?? "").trim();
  const authors = String(form.get("authors") ?? "").trim();
  const publicationInput = form.get("publicationUrl");
  const repositoryInput = form.get("repositoryUrl");
  const publicationUrl = url(publicationInput);
  const repositoryUrl = url(repositoryInput);
  if (title.length < 2 || !slug || abstract.length < 10 || !authors)
    return NextResponse.json(
      {
        message:
          "Title, authors, and an abstract of at least 10 characters are required.",
      },
      { status: 400 },
    );
  if (
    (publicationInput && !publicationUrl) ||
    (repositoryInput && !repositoryUrl)
  )
    return NextResponse.json(
      { message: "Links must be valid HTTP(S) URLs." },
      { status: 400 },
    );
  const image = form.get("image");
  const files = form
    .getAll("files")
    .filter((file): file is File => file instanceof File && file.size > 0);
  if (
    image instanceof File &&
    image.size > 0 &&
    (image.size > MAX_PROJECT_IMAGE_SIZE ||
      !(PROJECT_IMAGE_TYPES as readonly string[]).includes(image.type))
  )
    return NextResponse.json(
      { message: "Choose a valid image under 5 MB." },
      { status: 400 },
    );
  if (
    files.length > MAX_PROJECT_FILES ||
    files.some(
      (file) =>
        file.size > MAX_PROJECT_FILE_SIZE ||
        !(PROJECT_FILE_TYPES as readonly string[]).includes(file.type),
    )
  )
    return NextResponse.json(
      { message: "Attach up to 8 supported files under 10 MB each." },
      { status: 400 },
    );
  if (
    ((image instanceof File && image.size > 0) || files.length > 0) &&
    !projectStorageConfigured()
  )
    return NextResponse.json(
      { message: "Storage is not configured." },
      { status: 503 },
    );
  const item = await saveResearch({
    id: typeof form.get("id") === "string" ? String(form.get("id")) : undefined,
    title,
    slug,
    subtitle: String(form.get("subtitle") ?? "").trim(),
    abstract,
    authors,
    venue: String(form.get("venue") ?? "").trim() || null,
    publicationUrl,
    repositoryUrl,
    status: ["in_progress", "published", "archived"].includes(
      String(form.get("status")),
    )
      ? String(form.get("status"))
      : "in_progress",
    sortOrder: Math.max(1, Number(form.get("sortOrder")) || 1),
    techStack: stack(
      String(form.get("techCsv") ?? ""),
      form.getAll("techId").map(String),
    ),
  });
  const assets: Parameters<typeof updateResearchAssets>[1] = {};
  if (image instanceof File && image.size > 0) {
    const uploaded = await uploadProjectFile(
      `${crypto.randomUUID()}-${safeName(image.name)}`,
      image,
    );
    assets.imageUrl = uploaded.url;
    assets.imagePathname = uploaded.pathname;
    assets.imageAlt = String(form.get("imageAlt") ?? title).trim();
  }
  if (files.length) {
    assets.associatedFiles = [];
    for (const file of files) {
      const uploaded = await uploadProjectFile(
        `${crypto.randomUUID()}-${safeName(file.name)}`,
        file,
      );
      assets.associatedFiles.push({
        name: file.name,
        url: uploaded.url,
        pathname: uploaded.pathname,
        mimeType: file.type,
        size: String(file.size),
        isPublic: true,
      });
    }
  }
  if (Object.keys(assets).length) await updateResearchAssets(item.id, assets);
  revalidatePath("/research", "layout");
  revalidatePath("/");
  return NextResponse.json({
    data: item,
    message: form.get("id") ? "Research updated." : "Research created.",
  });
}
export async function PUT(request: Request) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  if (!sameOrigin(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  if (!projectStorageConfigured())
    return NextResponse.json(
      { message: "Storage is not configured." },
      { status: 503 },
    );
  const form = await request.formData();
  const id = String(form.get("id") ?? "");
  const current = await getResearchById(id);
  if (!current)
    return NextResponse.json(
      { message: "Research not found." },
      { status: 404 },
    );
  if (form.get("action") === "image") {
    const image = form.get("image");
    const imageAlt = String(form.get("imageAlt") ?? "").trim();
    if (
      !(image instanceof File) ||
      image.size > MAX_PROJECT_IMAGE_SIZE ||
      !(PROJECT_IMAGE_TYPES as readonly string[]).includes(image.type) ||
      !imageAlt
    )
      return NextResponse.json(
        { message: "Choose a valid image under 5 MB and provide alt text." },
        { status: 400 },
      );
    const uploaded = await uploadProjectFile(
      `${crypto.randomUUID()}-${safeName(image.name)}`,
      image,
    );
    await updateResearchAssets(id, {
      imageUrl: uploaded.url,
      imagePathname: uploaded.pathname,
      imageAlt,
    });
    if (current.imageUrl && current.imagePathname)
      await deleteProjectFile(current.imageUrl, current.imagePathname).catch(
        () => null,
      );
    revalidatePath("/research", "layout");
    revalidatePath("/");
    return NextResponse.json({ message: "Research image updated." });
  }
  const files = form
    .getAll("files")
    .filter((file): file is File => file instanceof File && file.size > 0);
  if (
    files.length + current.associatedFiles.length > MAX_PROJECT_FILES ||
    files.some(
      (file) =>
        file.size > MAX_PROJECT_FILE_SIZE ||
        !(PROJECT_FILE_TYPES as readonly string[]).includes(file.type),
    )
  )
    return NextResponse.json(
      { message: "Attach up to 8 supported files under 10 MB each." },
      { status: 400 },
    );
  const added: ProjectFile[] = [];
  for (const file of files) {
    const uploaded = await uploadProjectFile(
      `${crypto.randomUUID()}-${safeName(file.name)}`,
      file,
    );
    added.push({
      name: file.name,
      url: uploaded.url,
      pathname: uploaded.pathname,
      mimeType: file.type,
      size: String(file.size),
      isPublic: true,
    });
  }
  await updateResearchAssets(id, {
    associatedFiles: [...current.associatedFiles, ...added],
  });
  revalidatePath("/research", "layout");
  revalidatePath("/");
  return NextResponse.json({ message: "Research files attached." });
}

export async function PATCH(request: Request) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  if (!sameOrigin(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const body = await request.json();
  const current = await getResearchById(String(body.id ?? ""));
  if (!current)
    return NextResponse.json(
      { message: "Research not found." },
      { status: 404 },
    );
  const file = current.associatedFiles.find(
    (item) => item.pathname === body.pathname,
  );
  if (!file)
    return NextResponse.json({ message: "File not found." }, { status: 404 });
  if (body.action === "file_delete") {
    await deleteProjectFile(file.url, file.pathname);
    await updateResearchAssets(current.id, {
      associatedFiles: current.associatedFiles.filter(
        (item) => item.pathname !== file.pathname,
      ),
    });
  } else
    await updateResearchAssets(current.id, {
      associatedFiles: current.associatedFiles.map((item) =>
        item.pathname === file.pathname
          ? { ...item, isPublic: Boolean(body.isPublic) }
          : item,
      ),
    });
  revalidatePath("/research", "layout");
  revalidatePath("/");
  return NextResponse.json({
    message:
      body.action === "file_delete"
        ? "File deleted."
        : "File visibility updated.",
  });
}

export async function DELETE(request: Request) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  if (!sameOrigin(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const id = new URL(request.url).searchParams.get("id") ?? "";
  const current = await getResearchById(id);
  if (current)
    await Promise.allSettled([
      ...(current.imageUrl && current.imagePathname
        ? [deleteProjectFile(current.imageUrl, current.imagePathname)]
        : []),
      ...current.associatedFiles.map((file) =>
        deleteProjectFile(file.url, file.pathname),
      ),
    ]);
  await deleteResearch(id);
  revalidatePath("/research", "layout");
  revalidatePath("/");
  return NextResponse.json({ message: "Research deleted." });
}
