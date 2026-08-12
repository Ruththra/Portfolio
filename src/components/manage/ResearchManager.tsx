"use client";

import {
  File,
  Globe2,
  ImageUp,
  Lock,
  Paperclip,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { TechnologyIcon } from "@/components/icons/TechnologyIcon";
import { FileDropzone } from "@/components/manage/FileDropzone";
import { technologyGroups } from "@/data/skills";
import type { ResearchRecord } from "@/db/schema";

const researchTechnologyCatalog = new Map(
  technologyGroups.flatMap((group) =>
    group.technologies.flatMap((technology) => [
      [technology.name.toLowerCase(), technology] as const,
      [technology.id.toLowerCase(), technology] as const,
    ]),
  ),
);
const researchCatalogIds = new Set<string>(
  technologyGroups.flatMap((group) =>
    group.technologies.map((technology) => technology.id),
  ),
);
const defaultResearchTechnologyId = technologyGroups[0].technologies[0].id;
function parseTechCsv(value: string) {
  return [
    ...new Map(
      value
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => [name.toLowerCase(), name]),
    ).values(),
  ]
    .slice(0, 20)
    .map((name) => {
      const known = researchTechnologyCatalog.get(name.toLowerCase());
      return {
        id: known?.id ?? `custom-${name.toLowerCase()}`,
        name: known?.name ?? name,
        known: Boolean(known),
      };
    });
}

export function ResearchManager({ initial }: { initial: ResearchRecord[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<ResearchRecord | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [techCsv, setTechCsv] = useState("");
  const [techRows, setTechRows] = useState<
    Array<{ id: string; technologyId: string }>
  >([]);
  const [formVersion, setFormVersion] = useState(0);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setPending(true);
    try {
      const response = await fetch("/api/manage/research", {
        method: "POST",
        body: form,
      });
      const result = (await response.json()) as { message?: string };
      setMessage(result.message ?? "Request completed.");
      if (response.ok) {
        formElement.reset();
        setEditing(null);
        setTechCsv("");
        setTechRows([]);
        setFormVersion((current) => current + 1);
        router.refresh();
      }
    } catch {
      setMessage("Network error. The research entry was not saved.");
    } finally {
      setPending(false);
    }
  }
  async function uploadAssets(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setPending(true);
    const response = await fetch("/api/manage/research", {
      method: "PUT",
      body: new FormData(formElement),
    });
    const result = (await response.json()) as { message?: string };
    setMessage(result.message ?? "Upload completed.");
    if (response.ok) {
      formElement.reset();
      router.refresh();
    }
    setPending(false);
  }
  async function fileAction(
    item: ResearchRecord,
    pathname: string,
    action: "file_delete" | "file_visibility",
    isPublic?: boolean,
  ) {
    if (action === "file_delete" && !confirm("Delete this research file?"))
      return;
    setPending(true);
    const response = await fetch("/api/manage/research", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: item.id, pathname, action, isPublic }),
    });
    const result = (await response.json()) as { message?: string };
    setMessage(result.message ?? "File updated.");
    router.refresh();
    setPending(false);
  }
  async function remove(id: string) {
    if (!confirm("Delete this research entry?")) return;
    setPending(true);
    await fetch(`/api/manage/research?id=${id}`, { method: "DELETE" });
    router.refresh();
    setPending(false);
  }
  return (
    <>
      {message && (
        <div className="manage-notification info" role="status">
          <span>{message}</span>
          <button onClick={() => setMessage("")} aria-label="Dismiss">
            <X />
          </button>
        </div>
      )}
      <form
        className="manage-panel project-upload"
        onSubmit={submit}
        key={`${editing?.id ?? "new"}-${formVersion}`}
      >
        <div className="panel-heading">
          <div>
            <h2>{editing ? "Edit research" : "Add research"}</h2>
            <p>Publish research work, papers, and ongoing studies.</p>
          </div>
          {editing && (
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setEditing(null);
                setTechCsv("");
                setTechRows([]);
              }}
            >
              <X /> Cancel
            </button>
          )}
        </div>
        {editing && <input type="hidden" name="id" value={editing.id} />}
        <div className="form-grid">
          <label>
            Title
            <input
              name="title"
              required
              minLength={2}
              defaultValue={editing?.title}
            />
          </label>
          <label>
            Subtitle
            <input name="subtitle" defaultValue={editing?.subtitle} />
          </label>
          <label>
            Authors
            <input
              name="authors"
              required
              defaultValue={editing?.authors}
              placeholder="R. Sutharsan, A. Author"
            />
          </label>
          <label>
            Venue
            <input
              name="venue"
              defaultValue={editing?.venue ?? ""}
              placeholder="Journal or conference"
            />
          </label>
          <label>
            Status
            <select
              name="status"
              defaultValue={editing?.status ?? "in_progress"}
            >
              <option value="in_progress">In progress</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label>
            Display order
            <input
              type="number"
              name="sortOrder"
              min={1}
              required
              defaultValue={editing?.sortOrder ?? initial.length + 1}
            />
          </label>
          <label>
            Publication link
            <input
              type="url"
              name="publicationUrl"
              defaultValue={editing?.publicationUrl ?? ""}
            />
          </label>
          <label>
            Repository link
            <input
              type="url"
              name="repositoryUrl"
              defaultValue={editing?.repositoryUrl ?? ""}
            />
          </label>
        </div>
        <fieldset className="project-tech-editor">
          <legend>Tech stack</legend>
          <p>Select technologies from the icon catalog or paste a CSV list.</p>
          <label className="project-tech-csv">
            Technologies (CSV)
            <input
              name="techCsv"
              value={techCsv}
              onChange={(event) => {
                const value = event.currentTarget.value;
                const matched = parseTechCsv(value).filter(
                  (technology) => technology.known,
                );
                setTechCsv(value);
                setTechRows((current) => {
                  const selected = new Set(
                    current.map((row) => row.technologyId),
                  );
                  return [
                    ...current,
                    ...matched
                      .filter((technology) => !selected.has(technology.id))
                      .map((technology) => ({
                        id: crypto.randomUUID(),
                        technologyId: technology.id,
                      })),
                  ].slice(0, 20);
                });
              }}
              placeholder="Python, PyTorch, OpenAI"
            />
          </label>
          <div className="project-tech-rows">
            {techRows.map((row, index) => (
              <div className="project-tech-row" key={row.id}>
                <span className="project-tech-icon-preview">
                  <TechnologyIcon id={row.technologyId} />
                </span>
                <label>
                  <span className="sr-only">Technology {index + 1}</span>
                  <select
                    name="techId"
                    value={row.technologyId}
                    onChange={(event) => {
                      const technologyId = event.currentTarget.value;
                      setTechRows((current) =>
                        current.map((item) =>
                          item.id === row.id ? { ...item, technologyId } : item,
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
                  onClick={() =>
                    setTechRows((current) =>
                      current.filter((item) => item.id !== row.id),
                    )
                  }
                >
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>
          <button
            className="secondary-button project-tech-add"
            type="button"
            disabled={techRows.length >= 20}
            onClick={() =>
              setTechRows((current) => [
                ...current,
                {
                  id: crypto.randomUUID(),
                  technologyId: defaultResearchTechnologyId,
                },
              ])
            }
          >
            <Plus /> Add technology
          </button>
        </fieldset>
        {techCsv && (
          <ul className="project-tech-csv-preview" aria-live="polite">
            {parseTechCsv(techCsv).map((tech) => (
              <li key={tech.id}>
                <TechnologyIcon id={tech.id} />
                <span>{tech.name}</span>
                <small>{tech.known ? "Icon matched" : "Custom"}</small>
                <button
                  className="project-tech-csv-remove"
                  type="button"
                  aria-label={`Remove ${tech.name}`}
                  onClick={() => {
                    setTechCsv(
                      parseTechCsv(techCsv)
                        .filter((item) => item.id !== tech.id)
                        .map((item) => item.name)
                        .join(", "),
                    );
                    if (tech.known)
                      setTechRows((current) =>
                        current.filter((row) => row.technologyId !== tech.id),
                      );
                  }}
                >
                  <Trash2 />
                </button>
              </li>
            ))}
          </ul>
        )}
        <label className="project-description">
          Abstract
          <textarea
            name="abstract"
            required
            minLength={10}
            rows={8}
            defaultValue={editing?.abstract}
          />
        </label>
        {!editing && (
          <div className="project-upload-grid">
            <FileDropzone
              name="image"
              accept="image/jpeg,image/png,image/webp,image/avif"
              icon={<ImageUp />}
              title="Drop a research image or browse"
              description="JPEG, PNG, WebP, or AVIF · 5 MB"
            />
            <FileDropzone
              name="files"
              accept=".pdf,.zip,.json,.txt,.csv,.docx,.pptx,.xlsx"
              icon={<Paperclip />}
              title="Drop research files or browse"
              description="Up to 8 supported files · 10 MB each"
              maxFiles={8}
              multiple
            />
            <label>
              Image alternative text
              <input name="imageAlt" maxLength={240} />
            </label>
          </div>
        )}
        <button className="primary-button project-submit" disabled={pending}>
          {editing ? <Save /> : <Plus />}
          {pending ? "Saving…" : editing ? "Save research" : "Add research"}
        </button>
      </form>
      {editing && (
        <div className="research-asset-editor">
          <form className="project-edit-card" onSubmit={uploadAssets}>
            <input type="hidden" name="id" value={editing.id} />
            <input type="hidden" name="action" value="image" />
            <h3>Research image</h3>
            {editing.imageUrl && (
              <Image
                className="project-edit-image-preview"
                src={editing.imageUrl}
                alt={editing.imageAlt || "Current research image"}
                width={480}
                height={300}
              />
            )}
            <FileDropzone
              name="image"
              accept="image/jpeg,image/png,image/webp,image/avif"
              icon={<ImageUp />}
              title="Drop an image or browse"
              description="JPEG, PNG, WebP, or AVIF · 5 MB"
              required
            />
            <label>
              Image alternative text
              <input name="imageAlt" defaultValue={editing.imageAlt} required />
            </label>
            <button className="secondary-button" disabled={pending}>
              <ImageUp /> Replace image
            </button>
          </form>
          <form className="project-edit-card" onSubmit={uploadAssets}>
            <input type="hidden" name="id" value={editing.id} />
            <input type="hidden" name="action" value="files" />
            <h3>Associated files</h3>
            <FileDropzone
              name="files"
              accept=".pdf,.zip,.json,.txt,.csv,.docx,.pptx,.xlsx"
              icon={<Paperclip />}
              title="Drop documents or browse"
              description="PDF, ZIP, text, CSV, JSON, or Office · 10 MB each"
              maxFiles={8}
              multiple
              required
            />
            <button className="secondary-button" disabled={pending}>
              <Paperclip /> Attach files
            </button>
          </form>
        </div>
      )}
      <section className="project-library">
        <div className="panel-heading">
          <div>
            <h2>Research library</h2>
            <p>Entries appear publicly in display order.</p>
          </div>
        </div>
        <div className="project-admin-list">
          {initial.map((item) => (
            <article className="manage-panel research-admin-item" key={item.id}>
              <div>
                <span className={`status ${item.status}`}>
                  {item.status.replace("_", " ")}
                </span>
                <h3>{item.title}</h3>
                <p>{item.authors}</p>
                <p>{item.abstract}</p>
                <ul className="project-tech-list">
                  {item.techStack.map((tech) => (
                    <li key={tech.id}>
                      <TechnologyIcon id={tech.id} />
                      {tech.name}
                    </li>
                  ))}
                </ul>
                {item.associatedFiles.length > 0 && (
                  <ul className="project-document-list">
                    {item.associatedFiles.map((file) => (
                      <li key={file.pathname}>
                        <span>
                          <File /> {file.name}
                        </span>
                        <button
                          className="document-visibility-toggle"
                          onClick={() =>
                            fileAction(
                              item,
                              file.pathname,
                              "file_visibility",
                              !(file.isPublic ?? true),
                            )
                          }
                        >
                          {(file.isPublic ?? true) ? <Globe2 /> : <Lock />}
                          {(file.isPublic ?? true) ? "Public" : "Private"}
                        </button>
                        <a
                          className="secondary-button"
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download
                        </a>
                        <button
                          className="danger-button"
                          onClick={() =>
                            fileAction(item, file.pathname, "file_delete")
                          }
                        >
                          <Trash2 /> Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="project-admin-actions">
                <button
                  className="secondary-button"
                  onClick={() => {
                    setEditing(item);
                    setTechCsv(
                      item.techStack
                        .filter((tech) => !researchCatalogIds.has(tech.id))
                        .map((tech) => tech.name)
                        .join(", "),
                    );
                    setTechRows(
                      item.techStack
                        .filter((tech) => researchCatalogIds.has(tech.id))
                        .map((tech) => ({
                          id: crypto.randomUUID(),
                          technologyId: tech.id,
                        })),
                    );
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={pending}
                >
                  <Pencil /> Edit
                </button>
                <button
                  className="danger-button"
                  onClick={() => remove(item.id)}
                  disabled={pending}
                >
                  <Trash2 /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
