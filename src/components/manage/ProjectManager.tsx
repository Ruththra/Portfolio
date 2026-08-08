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
  Plus,
  Save,
  Trash2,
  Globe2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TechnologyIcon } from "@/components/icons/TechnologyIcon";
import { technologyGroups } from "@/data/skills";
import type { ProjectFile, ProjectTechnology } from "@/db/schema";

type ProjectItem = {
  id: string;
  title: string;
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

export function ProjectManager({
  initial,
  configured,
}: {
  initial: ProjectItem[];
  configured: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageName, setImageName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<
    Array<{ name: string; isPublic: boolean }>
  >([]);
  const [techRows, setTechRows] = useState<
    Array<{ id: string; technologyId: string }>
  >([]);
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

  function notify(message: string, type: Notification["type"]) {
    setNotification({ message, type });
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
            <select name="status" defaultValue="in_progress" required>
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
          <label className="project-dropzone">
            <ImageUp aria-hidden="true" />
            <strong>{imageName || "Choose a project image"}</strong>
            <span>JPEG, PNG, WebP, or AVIF · maximum 5 MB</span>
            <input
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              required
              disabled={!configured || pending}
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                if (!file) return;
                if (imagePreview) URL.revokeObjectURL(imagePreview);
                setImageName(file.name);
                setImagePreview(URL.createObjectURL(file));
              }}
            />
          </label>
          {imagePreview && (
            <Image
              className="project-image-preview"
              src={imagePreview}
              alt="Selected project preview"
              width={640}
              height={400}
              unoptimized
            />
          )}
          <label className="project-dropzone">
            <Paperclip aria-hidden="true" />
            <strong>
              {selectedFiles.length
                ? `${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"} selected`
                : "Add associated files (optional)"}
            </strong>
            <span>Up to 8 PDF, ZIP, text, CSV, JSON, or Office files</span>
            <input
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
              </li>
            ))}
          </ul>
        )}

        <fieldset className="project-tech-editor">
          <legend>Tech stack</legend>
          <p>Select technologies from the toolkit used on the public site.</p>
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
                    onChange={(event) =>
                      setTechRows((current) =>
                        current.map((item) =>
                          item.id === row.id
                            ? {
                                ...item,
                                technologyId: event.currentTarget.value,
                              }
                            : item,
                        ),
                      )
                    }
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
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <div className="project-admin-actions">
                  <label htmlFor={`project-order-${project.id}`}>Order</label>
                  <div>
                    <input
                      id={`project-order-${project.id}`}
                      type="number"
                      min={1}
                      max={initial.length}
                      value={orders[project.id] ?? project.sortOrder}
                      disabled={pending}
                      onChange={(event) =>
                        setOrders((current) => ({
                          ...current,
                          [project.id]: Number(event.currentTarget.value),
                        }))
                      }
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
