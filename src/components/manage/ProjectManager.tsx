"use client";

import {
  CheckCircle2,
  CircleAlert,
  Download,
  ExternalLink,
  File,
  Github,
  ImageUp,
  Linkedin,
  Lock,
  LoaderCircle,
  Paperclip,
  Pencil,
  Plus,
  Save,
  Trash2,
  Globe2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TechnologyIcon } from "@/components/icons/TechnologyIcon";
import { technologyGroups } from "@/data/skills";
import type { ProjectFile, ProjectTechnology } from "@/db/schema";

type ProjectItem = {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  githubUrl: string | null;
  linkedinUrl: string | null;
  liveUrl: string | null;
  status: string;
  sortOrder: number;
  associatedFiles: ProjectFile[];
  techStack: ProjectTechnology[];
};

type Notification = {
  message: string;
  type: "success" | "error" | "info";
};

const statusLabels: Record<string, string> = {
  planned: "Planned",
  in_progress: "In progress",
  completed: "Completed",
  archived: "Archived",
};
const defaultTechnologyId = technologyGroups[0].technologies[0].id;
const catalogTechnologies = technologyGroups.flatMap(
  (group) => group.technologies,
);
const catalogTechnologyIds = new Set<string>(
  catalogTechnologies.map((technology) => technology.id),
);
const catalogTechnologyNames = new Map(
  catalogTechnologies.flatMap((technology) => [
    [technology.name.toLocaleLowerCase(), technology],
    [technology.id.toLocaleLowerCase(), technology],
  ]),
);

function parseTechnologyCsv(csv: string) {
  const names = new Map(
    csv
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean)
      .map((name) => [name.toLocaleLowerCase(), name] as const),
  );
  return [...names.values()].slice(0, 20).map((name) => {
    const technology = catalogTechnologyNames.get(name.toLocaleLowerCase());
    return technology
      ? { id: technology.id, name: technology.name, known: true }
      : { id: `custom-${name.toLocaleLowerCase()}`, name, known: false };
  });
}

export function ProjectManager({
  initial,
  configured,
}: {
  initial: ProjectItem[];
  configured: boolean;
}) {
  const router = useRouter();
  const imageInput = useRef<HTMLInputElement>(null);
  const filesInput = useRef<HTMLInputElement>(null);
  const editImageInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageDragging, setImageDragging] = useState(false);
  const [filesDragging, setFilesDragging] = useState(false);
  const [editImageDragging, setEditImageDragging] = useState(false);
  const [editImageName, setEditImageName] = useState("");
  const [editImagePreview, setEditImagePreview] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageName, setImageName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<
    Array<{ name: string; isPublic: boolean }>
  >([]);
  const [techRows, setTechRows] = useState<
    Array<{ id: string; technologyId: string }>
  >([]);
  const [techCsv, setTechCsv] = useState("");
  const [editTechCsv, setEditTechCsv] = useState("");
  const [editTechIds, setEditTechIds] = useState<string[]>([]);
  const [orders, setOrders] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      initial.map((project) => [project.id, project.sortOrder]),
    ),
  );
  const [notification, setNotification] = useState<Notification | null>(
    configured
      ? null
      : {
          message:
            "Configure Vercel Blob or Supabase storage before uploading projects.",
          type: "info",
        },
  );

  useEffect(() => {
    setOrders(
      Object.fromEntries(
        initial.map((project) => [project.id, project.sortOrder]),
      ),
    );
  }, [initial]);

  useEffect(
    () => () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    },
    [imagePreview],
  );

  useEffect(
    () => () => {
      if (editImagePreview) URL.revokeObjectURL(editImagePreview);
    },
    [editImagePreview],
  );

  function notify(message: string, type: Notification["type"]) {
    setNotification({ message, type });
  }

  function setInputFiles(input: HTMLInputElement, files: readonly File[]) {
    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(file));
    input.files = transfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function selectImage(file: File) {
    if (!configured || pending || !imageInput.current) return;
    if (
      !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
        file.type,
      )
    ) {
      notify("Drop a JPEG, PNG, WebP, or AVIF image.", "error");
      return;
    }
    setInputFiles(imageInput.current, [file]);
  }

  function removeSelectedImage() {
    if (imageInput.current) setInputFiles(imageInput.current, []);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview("");
    setImageName("");
  }

  function selectAssociatedFiles(files: readonly File[]) {
    if (!configured || pending || !filesInput.current) return;
    setInputFiles(filesInput.current, files.slice(0, 8));
  }

  function selectEditImage(file: File) {
    if (!configured || pending || !editImageInput.current) return;
    if (
      !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
        file.type,
      )
    ) {
      notify("Drop a JPEG, PNG, WebP, or AVIF image.", "error");
      return;
    }
    setInputFiles(editImageInput.current, [file]);
  }

  function removeSelectedFile(index: number) {
    if (!filesInput.current) return;
    const transfer = new DataTransfer();
    Array.from(filesInput.current.files ?? []).forEach((file, itemIndex) => {
      if (itemIndex !== index) transfer.items.add(file);
    });
    filesInput.current.files = transfer.files;
    setSelectedFiles((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setNotification(null);
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/manage/projects", {
        method: "POST",
        body: new FormData(form),
      });
      const result = (await response.json()) as { message?: string };
      notify(
        result.message ??
          (response.ok
            ? "Project uploaded successfully."
            : "Project upload failed."),
        response.ok ? "success" : "error",
      );
      if (response.ok) {
        form.reset();
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview("");
        setImageName("");
        setSelectedFiles([]);
        setTechRows([]);
        setTechCsv("");
        router.refresh();
      }
    } catch {
      notify("Network error. The project was not uploaded.", "error");
    } finally {
      setPending(false);
    }
  }

  async function updateOrder(project: ProjectItem) {
    setPending(true);
    setNotification(null);
    try {
      const response = await fetch("/api/manage/projects", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: project.id,
          sortOrder: orders[project.id],
        }),
      });
      const result = (await response.json()) as { message?: string };
      notify(
        result.message ??
          (response.ok ? "Project order updated." : "Reordering failed."),
        response.ok ? "success" : "error",
      );
      if (response.ok) router.refresh();
    } catch {
      notify("Network error. The project order was not updated.", "error");
    } finally {
      setPending(false);
    }
  }

  async function updateDetails(
    event: React.FormEvent<HTMLFormElement>,
    project: ProjectItem,
  ) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setNotification(null);
    try {
      const response = await fetch("/api/manage/projects", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "project_update",
          id: project.id,
          title: form.get("title"),
          subtitle: form.get("subtitle"),
          description: form.get("description"),
          imageAlt: form.get("imageAlt"),
          githubUrl: form.get("githubUrl"),
          linkedinUrl: form.get("linkedinUrl"),
          liveUrl: form.get("liveUrl"),
          status: form.get("status"),
          techIds: form.getAll("techIds"),
          techCsv: form.get("techCsv"),
        }),
      });
      const result = (await response.json()) as { message?: string };
      notify(
        result.message ??
          (response.ok ? "Project updated." : "Project update failed."),
        response.ok ? "success" : "error",
      );
      if (response.ok) {
        setEditingId(null);
        router.refresh();
      }
    } catch {
      notify("Network error. The project was not updated.", "error");
    } finally {
      setPending(false);
    }
  }

  async function updateImage(
    event: React.FormEvent<HTMLFormElement>,
    project: ProjectItem,
  ) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    form.set("id", project.id);
    setPending(true);
    setNotification(null);
    try {
      const response = await fetch("/api/manage/projects", {
        method: "PUT",
        body: form,
      });
      const result = (await response.json()) as { message?: string };
      notify(
        result.message ??
          (response.ok ? "Project image updated." : "Image update failed."),
        response.ok ? "success" : "error",
      );
      if (response.ok) {
        formElement.reset();
        if (editImagePreview) URL.revokeObjectURL(editImagePreview);
        setEditImagePreview("");
        setEditImageName("");
        router.refresh();
      }
    } catch {
      notify("Network error. The project image was not updated.", "error");
    } finally {
      setPending(false);
    }
  }

  async function toggleFileVisibility(project: ProjectItem, file: ProjectFile) {
    const isPublic = !(file.isPublic ?? true);
    setPending(true);
    setNotification(null);
    try {
      const response = await fetch("/api/manage/projects", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "file_visibility",
          id: project.id,
          pathname: file.pathname,
          isPublic,
        }),
      });
      const result = (await response.json()) as { message?: string };
      notify(
        result.message ??
          (response.ok
            ? "Document visibility updated."
            : "Visibility update failed."),
        response.ok ? "success" : "error",
      );
      if (response.ok) router.refresh();
    } catch {
      notify("Network error. Document visibility was not updated.", "error");
    } finally {
      setPending(false);
    }
  }

  async function removeProjectFile(project: ProjectItem, file: ProjectFile) {
    if (!confirm(`Delete ${file.name}? This cannot be undone.`)) return;
    setPending(true);
    setNotification(null);
    try {
      const response = await fetch("/api/manage/projects", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "file_delete",
          id: project.id,
          pathname: file.pathname,
        }),
      });
      const result = (await response.json()) as { message?: string };
      notify(
        result.message ??
          (response.ok ? "Document deleted." : "Document deletion failed."),
        response.ok ? "success" : "error",
      );
      if (response.ok) router.refresh();
    } catch {
      notify("Network error. The document was not deleted.", "error");
    } finally {
      setPending(false);
    }
  }

  async function remove(project: ProjectItem) {
    if (!confirm(`Delete ${project.title} and all associated files?`)) return;
    setPending(true);
    setNotification(null);
    try {
      const response = await fetch(`/api/manage/projects?id=${project.id}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as { message?: string };
      notify(
        result.message ??
          (response.ok ? "Project deleted." : "Project deletion failed."),
        response.ok ? "success" : "error",
      );
      if (response.ok) router.refresh();
    } catch {
      notify("Network error. The project was not deleted.", "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {notification && (
        <div
          className={`manage-notification ${notification.type}`}
          role={notification.type === "error" ? "alert" : "status"}
        >
          {notification.type === "success" ? (
            <CheckCircle2 aria-hidden="true" />
          ) : (
            <CircleAlert aria-hidden="true" />
          )}
          <span>{notification.message}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotification(null)}
          >
            <X aria-hidden="true" />
          </button>
        </div>
      )}

      <form className="manage-panel project-upload" onSubmit={upload}>
        <div className="panel-heading">
          <div>
            <h2>Add project</h2>
            <p>Upload the project details and supporting files.</p>
          </div>
        </div>

        <div className="form-grid">
          <label>
            Project title
            <input name="title" required minLength={2} maxLength={120} />
          </label>
          <label>
            Project subtitle
            <input name="subtitle" required minLength={2} maxLength={180} />
          </label>
          <label>
            Display order
            <input
              name="sortOrder"
              type="number"
              min={1}
              max={initial.length + 1}
              defaultValue={initial.length + 1}
              required
            />
          </label>
          <label>
            Project status
            <select name="status" defaultValue="completed" required>
              <option value="planned">Planned</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label>
            GitHub link (optional)
            <input
              name="githubUrl"
              type="url"
              placeholder="https://github.com/…"
            />
          </label>
          <label>
            LinkedIn link (optional)
            <input
              name="linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/…"
            />
          </label>
          <label>
            Live site link (optional)
            <input
              name="liveUrl"
              type="url"
              placeholder="https://example.com"
            />
          </label>
          <label>
            Image alternative text
            <input name="imageAlt" required maxLength={240} />
          </label>
        </div>

        <label className="project-description">
          Description
          <textarea
            name="description"
            required
            minLength={10}
            maxLength={5000}
            rows={7}
          />
        </label>

        <div className="project-upload-grid">
          <label
            className={`project-dropzone${imageDragging ? "is-dragging" : ""}`}
            onDragEnter={(event) => {
              event.preventDefault();
              setImageDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node))
                setImageDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setImageDragging(false);
              const file = event.dataTransfer.files[0];
              if (file) selectImage(file);
            }}
          >
            <ImageUp aria-hidden="true" />
            <strong>{imageName || "Choose a project image"}</strong>
            <span>JPEG, PNG, WebP, or AVIF · maximum 5 MB</span>
            <input
              ref={imageInput}
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              required
              disabled={!configured || pending}
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                if (!file) {
                  setImageName("");
                  setImagePreview("");
                  return;
                }
                if (imagePreview) URL.revokeObjectURL(imagePreview);
                setImageName(file.name);
                setImagePreview(URL.createObjectURL(file));
              }}
            />
          </label>
          {imagePreview && (
            <div className="project-image-selection">
              <Image
                className="project-image-preview"
                src={imagePreview}
                alt="Selected project preview"
                width={640}
                height={400}
                unoptimized
              />
              <button
                className="danger-button project-image-remove"
                type="button"
                disabled={pending}
                onClick={removeSelectedImage}
              >
                <Trash2 aria-hidden="true" /> Remove image
              </button>
            </div>
          )}
          <label
            className={`project-dropzone${filesDragging ? "is-dragging" : ""}`}
            onDragEnter={(event) => {
              event.preventDefault();
              setFilesDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node))
                setFilesDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setFilesDragging(false);
              selectAssociatedFiles(Array.from(event.dataTransfer.files));
            }}
          >
            <Paperclip aria-hidden="true" />
            <strong>
              {selectedFiles.length
                ? `${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"} selected`
                : "Add associated files (optional)"}
            </strong>
            <span>Up to 8 PDF, ZIP, text, CSV, JSON, or Office files</span>
            <input
              ref={filesInput}
              name="files"
              type="file"
              accept=".pdf,.zip,.json,.txt,.csv,.docx,.pptx,.xlsx"
              multiple
              disabled={!configured || pending}
              onChange={(event) =>
                setSelectedFiles(
                  Array.from(event.currentTarget.files ?? []).map((file) => ({
                    name: file.name,
                    isPublic: true,
                  })),
                )
              }
            />
          </label>
        </div>
        {selectedFiles.length > 0 && (
          <ul className="project-selected-files">
            {selectedFiles.map((file, index) => (
              <li key={`${file.name}-${index}`}>
                <span>
                  <File aria-hidden="true" /> {file.name}
                </span>
                <input
                  type="hidden"
                  name="fileVisibility"
                  value={file.isPublic ? "public" : "private"}
                />
                <button
                  className="document-visibility-toggle"
                  type="button"
                  aria-pressed={file.isPublic}
                  onClick={() =>
                    setSelectedFiles((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, isPublic: !item.isPublic }
                          : item,
                      ),
                    )
                  }
                >
                  {file.isPublic ? (
                    <Globe2 aria-hidden="true" />
                  ) : (
                    <Lock aria-hidden="true" />
                  )}
                  {file.isPublic ? "Public" : "Private"}
                </button>
                <button
                  className="danger-button project-selected-file-remove"
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  disabled={pending}
                  onClick={() => removeSelectedFile(index)}
                >
                  <Trash2 aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <fieldset className="project-tech-editor">
          <legend>Tech stack</legend>
          <p>
            Select technologies from the icon catalog or add a comma-separated
            list. Unmatched names use a generic code icon.
          </p>
          <label className="project-tech-csv">
            Technologies (CSV)
            <input
              name="techCsv"
              placeholder="Astro, Redis, GraphQL"
              maxLength={1000}
              value={techCsv}
              onChange={(event) => {
                const value = event.currentTarget.value;
                const matches = parseTechnologyCsv(value).filter(
                  (technology) => technology.known,
                );
                setTechCsv(value);
                setTechRows((current) => {
                  const selected = new Set(
                    current.map((row) => row.technologyId),
                  );
                  return [
                    ...current,
                    ...matches
                      .filter((technology) => !selected.has(technology.id))
                      .map((technology) => ({
                        id: crypto.randomUUID(),
                        technologyId: technology.id,
                      })),
                  ].slice(0, 20);
                });
              }}
            />
          </label>
          {techCsv && (
            <ul className="project-tech-csv-preview" aria-live="polite">
              {parseTechnologyCsv(techCsv).map((technology) => (
                <li key={technology.id}>
                  <TechnologyIcon id={technology.id} />
                  <span>{technology.name}</span>
                  <small>{technology.known ? "Icon matched" : "Custom"}</small>
                  <button
                    className="project-tech-csv-remove"
                    type="button"
                    aria-label={`Remove ${technology.name}`}
                    disabled={pending}
                    onClick={() => {
                      setTechCsv(
                        parseTechnologyCsv(techCsv)
                          .filter((item) => item.id !== technology.id)
                          .map((item) => item.name)
                          .join(", "),
                      );
                      if (technology.known)
                        setTechRows((current) =>
                          current.filter(
                            (row) => row.technologyId !== technology.id,
                          ),
                        );
                    }}
                  >
                    <Trash2 aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="project-tech-rows">
            {techRows.map((row, index) => (
              <div className="project-tech-row" key={row.id}>
                <span className="project-tech-icon-preview" aria-hidden="true">
                  <TechnologyIcon id={row.technologyId} />
                </span>
                <label>
                  <span className="sr-only">Technology {index + 1}</span>
                  <select
                    name="techId"
                    value={row.technologyId}
                    required
                    disabled={pending}
                    onChange={(event) => {
                      const technologyId = event.currentTarget.value;
                      setTechRows((current) =>
                        current.map((item) =>
                          item.id === row.id
                            ? {
                                ...item,
                                technologyId,
                              }
                            : item,
                        ),
                      );
                    }}
                  >
                    {technologyGroups.map((group) => (
                      <optgroup label={group.title} key={group.id}>
                        {group.technologies.map((technology) => (
                          <option key={technology.id} value={technology.id}>
                            {technology.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>
                <button
                  className="danger-button project-tech-remove"
                  type="button"
                  aria-label={`Remove technology ${index + 1}`}
                  disabled={pending}
                  onClick={() =>
                    setTechRows((current) =>
                      current.filter((item) => item.id !== row.id),
                    )
                  }
                >
                  <Trash2 aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
          <button
            className="secondary-button project-tech-add"
            type="button"
            disabled={pending || techRows.length >= 20}
            onClick={() =>
              setTechRows((current) => [
                ...current,
                { id: crypto.randomUUID(), technologyId: defaultTechnologyId },
              ])
            }
          >
            <Plus aria-hidden="true" /> Add technology
          </button>
        </fieldset>

        <button
          className="primary-button project-submit"
          disabled={!configured || pending}
        >
          {pending && <LoaderCircle className="spin" aria-hidden="true" />}
          {pending ? "Uploading…" : "Upload project"}
        </button>
      </form>

      <section
        className="project-library"
        aria-labelledby="project-library-title"
      >
        <div className="panel-heading">
          <div>
            <h2 id="project-library-title">Project order</h2>
            <p>Lower numbers appear first on the public site.</p>
          </div>
        </div>
        {initial.length ? (
          <div className="project-admin-list">
            {initial.map((project) => (
              <article
                className="manage-panel project-admin-item"
                key={project.id}
              >
                <Image
                  src={project.imageUrl}
                  alt={project.imageAlt}
                  width={180}
                  height={112}
                />
                <div className="project-admin-copy">
                  <span className={`status ${project.status}`}>
                    {statusLabels[project.status] ?? project.status}
                  </span>
                  <h3>{project.title}</h3>
                  {project.subtitle && (
                    <p className="project-admin-subtitle">{project.subtitle}</p>
                  )}
                  <p>{project.description}</p>
                  {project.techStack.length > 0 && (
                    <ul className="project-tech-list" aria-label="Tech stack">
                      {project.techStack.map((technology) => (
                        <li key={technology.id}>
                          <TechnologyIcon id={technology.id} />
                          {technology.name}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="project-meta-links">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Github aria-hidden="true" /> GitHub
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink aria-hidden="true" /> Live site
                      </a>
                    )}
                    {project.linkedinUrl && (
                      <a
                        href={project.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Linkedin aria-hidden="true" /> LinkedIn
                      </a>
                    )}
                    {project.associatedFiles.length > 0 && (
                      <span>
                        <Paperclip aria-hidden="true" />{" "}
                        {project.associatedFiles.length} file
                        {project.associatedFiles.length === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                  {project.associatedFiles.length > 0 && (
                    <ul className="project-document-list">
                      {project.associatedFiles.map((file) => {
                        const isPublic = file.isPublic ?? true;
                        return (
                          <li key={file.pathname}>
                            <span title={file.name}>
                              <File aria-hidden="true" /> {file.name}
                            </span>
                            <button
                              className="document-visibility-toggle"
                              type="button"
                              aria-pressed={isPublic}
                              disabled={pending}
                              onClick={() =>
                                toggleFileVisibility(project, file)
                              }
                            >
                              {isPublic ? (
                                <Globe2 aria-hidden="true" />
                              ) : (
                                <Lock aria-hidden="true" />
                              )}
                              {isPublic ? "Public" : "Private"}
                            </button>
                            <a
                              className="secondary-button"
                              href={file.url}
                              download={file.name}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Download aria-hidden="true" /> Download
                            </a>
                            <button
                              className="danger-button"
                              type="button"
                              aria-label={`Delete ${file.name}`}
                              disabled={pending}
                              onClick={() => removeProjectFile(project, file)}
                            >
                              <Trash2 aria-hidden="true" /> Delete
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {editingId === project.id && (
                    <div className="project-edit-section">
                      <div className="project-edit-heading">
                        <div>
                          <h4>Edit {project.title}</h4>
                          <p>
                            Update the project image and information in separate
                            sections.
                          </p>
                        </div>
                        <button
                          className="secondary-button"
                          type="button"
                          disabled={pending}
                          onClick={() => setEditingId(null)}
                        >
                          <X aria-hidden="true" /> Close
                        </button>
                      </div>
                      <form
                        className="project-image-edit-form project-edit-card"
                        onSubmit={(event) => updateImage(event, project)}
                      >
                        <div className="project-edit-card-heading">
                          <ImageUp aria-hidden="true" />
                          <div>
                            <h5>Project image</h5>
                            <p>Replace the image shown on the public site.</p>
                          </div>
                        </div>
                        <div className="project-image-edit-grid">
                          <label
                            className={`project-dropzone${editImageDragging ? "is-dragging" : ""}`}
                            onDragEnter={(event) => {
                              event.preventDefault();
                              setEditImageDragging(true);
                            }}
                            onDragOver={(event) => event.preventDefault()}
                            onDragLeave={(event) => {
                              if (
                                !event.currentTarget.contains(
                                  event.relatedTarget as Node,
                                )
                              )
                                setEditImageDragging(false);
                            }}
                            onDrop={(event) => {
                              event.preventDefault();
                              setEditImageDragging(false);
                              const file = event.dataTransfer.files[0];
                              if (file) selectEditImage(file);
                            }}
                          >
                            <ImageUp aria-hidden="true" />
                            <strong>
                              {editImageName ||
                                "Drop a new image here or browse"}
                            </strong>
                            <span>JPEG, PNG, WebP, or AVIF · maximum 5 MB</span>
                            <input
                              ref={editImageInput}
                              name="image"
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/avif"
                              required
                              disabled={!configured || pending}
                              onChange={(event) => {
                                const file = event.currentTarget.files?.[0];
                                if (!file) {
                                  setEditImageName("");
                                  setEditImagePreview("");
                                  return;
                                }
                                if (editImagePreview)
                                  URL.revokeObjectURL(editImagePreview);
                                setEditImageName(file.name);
                                setEditImagePreview(URL.createObjectURL(file));
                              }}
                            />
                          </label>
                          <div className="project-image-edit-fields">
                            {editImagePreview ? (
                              <Image
                                className="project-edit-image-preview"
                                src={editImagePreview}
                                alt="New project image preview"
                                width={480}
                                height={300}
                                unoptimized
                              />
                            ) : (
                              <Image
                                className="project-edit-image-preview"
                                src={project.imageUrl}
                                alt="Current project image"
                                width={480}
                                height={300}
                              />
                            )}
                            <label>
                              Image alternative text
                              <input
                                name="imageAlt"
                                defaultValue={project.imageAlt}
                                required
                                maxLength={240}
                              />
                            </label>
                          </div>
                        </div>
                        <button
                          className="secondary-button"
                          disabled={!configured || pending}
                        >
                          <ImageUp aria-hidden="true" />
                          {pending ? "Replacing…" : "Replace image"}
                        </button>
                      </form>
                      <form
                        className="project-edit-form project-edit-card"
                        onSubmit={(event) => updateDetails(event, project)}
                      >
                        <div className="project-edit-card-heading">
                          <Pencil aria-hidden="true" />
                          <div>
                            <h5>Project information</h5>
                            <p>
                              Edit content, links, status, and technologies.
                            </p>
                          </div>
                        </div>
                        <div className="form-grid">
                          <label>
                            Project title
                            <input
                              name="title"
                              defaultValue={project.title}
                              required
                              minLength={2}
                              maxLength={120}
                            />
                          </label>
                          <label>
                            Project subtitle
                            <input
                              name="subtitle"
                              defaultValue={project.subtitle}
                              required
                              minLength={2}
                              maxLength={180}
                            />
                          </label>
                          <label>
                            Status
                            <select
                              name="status"
                              defaultValue={project.status}
                              required
                            >
                              <option value="planned">Planned</option>
                              <option value="in_progress">In progress</option>
                              <option value="completed">Completed</option>
                              <option value="archived">Archived</option>
                            </select>
                          </label>
                          <label>
                            Image alternative text
                            <input
                              name="imageAlt"
                              defaultValue={project.imageAlt}
                              required
                              maxLength={240}
                            />
                          </label>
                          <label>
                            GitHub link (optional)
                            <input
                              name="githubUrl"
                              type="url"
                              defaultValue={project.githubUrl ?? ""}
                            />
                          </label>
                          <label>
                            LinkedIn link (optional)
                            <input
                              name="linkedinUrl"
                              type="url"
                              defaultValue={project.linkedinUrl ?? ""}
                            />
                          </label>
                          <label>
                            Live site link (optional)
                            <input
                              name="liveUrl"
                              type="url"
                              defaultValue={project.liveUrl ?? ""}
                            />
                          </label>
                          <label>
                            Tech stack
                            <select
                              name="techIds"
                              multiple
                              size={6}
                              value={editTechIds}
                              onChange={(event) =>
                                setEditTechIds(
                                  Array.from(
                                    event.currentTarget.selectedOptions,
                                    (option) => option.value,
                                  ),
                                )
                              }
                            >
                              {technologyGroups.map((group) => (
                                <optgroup label={group.title} key={group.id}>
                                  {group.technologies.map((technology) => (
                                    <option
                                      key={technology.id}
                                      value={technology.id}
                                    >
                                      {technology.name}
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                            <small>
                              Hold Ctrl or Command to select multiple
                              technologies.
                            </small>
                          </label>
                          <label>
                            Additional technologies (CSV)
                            <input
                              name="techCsv"
                              value={editTechCsv}
                              onChange={(event) => {
                                const value = event.currentTarget.value;
                                const matchedIds = parseTechnologyCsv(value)
                                  .filter((technology) => technology.known)
                                  .map((technology) => technology.id);
                                setEditTechCsv(value);
                                setEditTechIds((current) => [
                                  ...new Set([...current, ...matchedIds]),
                                ]);
                              }}
                              placeholder="Astro, Redis, GraphQL"
                              maxLength={1000}
                            />
                            <small>
                              Known names receive their catalog icon; other
                              names receive a generic code icon.
                            </small>
                          </label>
                          {editTechCsv && (
                            <ul
                              className="project-tech-csv-preview"
                              aria-live="polite"
                            >
                              {parseTechnologyCsv(editTechCsv).map(
                                (technology) => (
                                  <li key={technology.id}>
                                    <TechnologyIcon id={technology.id} />
                                    <span>{technology.name}</span>
                                    <small>
                                      {technology.known
                                        ? "Icon matched"
                                        : "Custom"}
                                    </small>
                                    <button
                                      className="project-tech-csv-remove"
                                      type="button"
                                      aria-label={`Remove ${technology.name}`}
                                      disabled={pending}
                                      onClick={() => {
                                        setEditTechCsv(
                                          parseTechnologyCsv(editTechCsv)
                                            .filter(
                                              (item) =>
                                                item.id !== technology.id,
                                            )
                                            .map((item) => item.name)
                                            .join(", "),
                                        );
                                        if (technology.known)
                                          setEditTechIds((current) =>
                                            current.filter(
                                              (technologyId) =>
                                                technologyId !== technology.id,
                                            ),
                                          );
                                      }}
                                    >
                                      <Trash2 aria-hidden="true" />
                                    </button>
                                  </li>
                                ),
                              )}
                            </ul>
                          )}
                        </div>
                        <label className="project-description">
                          Description
                          <textarea
                            name="description"
                            defaultValue={project.description}
                            required
                            minLength={10}
                            maxLength={5000}
                            rows={7}
                          />
                        </label>
                        <div className="project-edit-actions">
                          <button className="primary-button" disabled={pending}>
                            {pending && (
                              <LoaderCircle
                                className="spin"
                                aria-hidden="true"
                              />
                            )}
                            {pending ? "Saving…" : "Save changes"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
                <div className="project-admin-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    aria-expanded={editingId === project.id}
                    disabled={pending}
                    onClick={() => {
                      if (editImagePreview)
                        URL.revokeObjectURL(editImagePreview);
                      setEditImagePreview("");
                      setEditImageName("");
                      setEditImageDragging(false);
                      setEditTechIds(
                        project.techStack
                          .map((technology) => technology.id)
                          .filter((technologyId) =>
                            catalogTechnologyIds.has(technologyId),
                          ),
                      );
                      setEditTechCsv(
                        project.techStack
                          .filter(
                            (technology) =>
                              !catalogTechnologyIds.has(technology.id),
                          )
                          .map((technology) => technology.name)
                          .join(", "),
                      );
                      setEditingId((current) =>
                        current === project.id ? null : project.id,
                      );
                    }}
                  >
                    <Pencil aria-hidden="true" />
                    {editingId === project.id ? "Close editor" : "Edit"}
                  </button>
                  <label htmlFor={`project-order-${project.id}`}>Order</label>
                  <div>
                    <input
                      id={`project-order-${project.id}`}
                      type="number"
                      min={1}
                      max={initial.length}
                      value={orders[project.id] ?? project.sortOrder}
                      disabled={pending}
                      onChange={(event) => {
                        const sortOrder = Number(event.currentTarget.value);
                        setOrders((current) => ({
                          ...current,
                          [project.id]: sortOrder,
                        }));
                      }}
                    />
                    <button
                      className="secondary-button"
                      type="button"
                      disabled={
                        pending || orders[project.id] === project.sortOrder
                      }
                      onClick={() => updateOrder(project)}
                    >
                      <Save aria-hidden="true" /> Save order
                    </button>
                  </div>
                  <button
                    className="danger-button"
                    type="button"
                    disabled={pending}
                    onClick={() => remove(project)}
                  >
                    <Trash2 aria-hidden="true" /> Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="manage-panel">
            <p>No projects uploaded yet.</p>
          </div>
        )}
      </section>
    </>
  );
}
