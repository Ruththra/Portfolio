"use client";

import {
  CheckCircle2,
  CircleAlert,
  FileText,
  Pencil,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ResumeItem = {
  id: string;
  fileName: string;
  mimeType: string;
  size: string;
  selected: boolean;
  createdAt: Date;
};

type Notification = {
  message: string;
  type: "success" | "error" | "info";
};

export function ResumeManager({
  initial,
  configured,
}: {
  initial: ResumeItem[];
  configured: boolean;
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editedName, setEditedName] = useState("");
  const [viewId, setViewId] = useState(
    initial.find((item) => item.selected)?.id ?? initial[0]?.id ?? "",
  );
  const [notification, setNotification] = useState<Notification | null>(
    configured
      ? null
      : {
          message:
            "Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable resume storage.",
          type: "info",
        },
  );

  function notify(message: string, type: Notification["type"]) {
    setNotification({ message, type });
  }

  useEffect(() => {
    if (initial.some((item) => item.id === viewId)) return;
    setViewId(
      initial.find((item) => item.selected)?.id ?? initial[0]?.id ?? "",
    );
  }, [initial, viewId]);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setNotification(null);
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/manage/resumes", {
        method: "POST",
        body: new FormData(form),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        notify(result.message ?? "Resume upload failed.", "error");
        return;
      }
      form.reset();
      setFileName("");
      notify(result.message ?? "Resume uploaded successfully.", "success");
      router.refresh();
    } catch {
      notify("Network error. The resume was not uploaded.", "error");
    } finally {
      setPending(false);
    }
  }

  async function select(id: string) {
    setPending(true);
    setNotification(null);
    try {
      const response = await fetch("/api/manage/resumes", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = (await response.json()) as { message?: string };
      notify(
        result.message ??
          (response.ok
            ? "Public resume updated successfully."
            : "Resume selection failed."),
        response.ok ? "success" : "error",
      );
      if (response.ok) router.refresh();
    } catch {
      notify("Network error. The resume selection was not changed.", "error");
    } finally {
      setPending(false);
    }
  }

  async function remove(item: ResumeItem) {
    if (!confirm(`Delete ${item.fileName}? This cannot be undone.`)) return;
    setPending(true);
    setNotification(null);
    try {
      const response = await fetch(`/api/manage/resumes?id=${item.id}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as { message?: string };
      notify(
        result.message ??
          (response.ok
            ? "Resume deleted successfully."
            : "Resume deletion failed."),
        response.ok ? "success" : "error",
      );
      if (response.ok) router.refresh();
    } catch {
      notify("Network error. The resume was not deleted.", "error");
    } finally {
      setPending(false);
    }
  }

  async function rename(event: React.FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setPending(true);
    setNotification(null);
    try {
      const response = await fetch("/api/manage/resumes", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "rename", id, fileName: editedName }),
      });
      const result = (await response.json()) as { message?: string };
      notify(
        result.message ??
          (response.ok
            ? "Resume renamed successfully."
            : "Resume rename failed."),
        response.ok ? "success" : "error",
      );
      if (response.ok) {
        setEditingId("");
        setEditedName("");
        router.refresh();
      }
    } catch {
      notify("Network error. The resume was not renamed.", "error");
    } finally {
      setPending(false);
    }
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    if (!configured || pending || !fileInput.current) return;

    const file = event.dataTransfer.files[0];
    if (!file) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    fileInput.current.files = transfer.files;
    setFileName(file.name);
  }

  return (
    <>
      {notification && (
        <div
          className={`manage-notification ${notification.type}`}
          role={notification.type === "error" ? "alert" : "status"}
          aria-live={notification.type === "error" ? "assertive" : "polite"}
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
      <form className="manage-panel resume-upload" onSubmit={upload}>
        <h2>Upload résumé</h2>
        <p>
          PDF only, up to 10 MB. The first upload is selected automatically.
        </p>
        <label
          className={["resume-dropzone", dragging && "is-dragging"]
            .filter(Boolean)
            .join(" ")}
          onDragEnter={() => setDragging(true)}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setDragging(false);
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDrop={handleDrop}
        >
          <Upload aria-hidden="true" />
          <span className="resume-dropzone-title">
            {fileName || "Drag and drop your PDF here"}
          </span>
          <span>or choose a file</span>
          <input
            ref={fileInput}
            name="file"
            type="file"
            accept="application/pdf,.pdf"
            disabled={!configured || pending}
            required
            onChange={(event) =>
              setFileName(event.currentTarget.files?.[0]?.name ?? "")
            }
          />
        </label>
        <label className="resume-file-name">
          Save as (optional)
          <input
            name="fileName"
            maxLength={176}
            placeholder="e.g. Jane-Doe-Resume"
            disabled={!configured || pending}
          />
          <small>The .pdf extension is added automatically.</small>
        </label>
        <button className="primary-button" disabled={!configured || pending}>
          {pending ? "Working…" : "Upload résumé"}
        </button>
      </form>

      <section
        className="resume-library"
        aria-labelledby="resume-library-title"
      >
        <div className="panel-heading">
          <h2 id="resume-library-title">Résumé library</h2>
          <p>Select the PDF downloaded from the public résumé button.</p>
        </div>
        {initial.length ? (
          <div className="resume-list">
            {initial.map((item) => (
              <article className="manage-panel" key={item.id}>
                <div>
                  <span
                    className={`status ${item.selected ? "published" : "draft"}`}
                  >
                    {item.selected ? "Public" : "Not selected"}
                  </span>
                  {editingId === item.id ? (
                    <form
                      className="resume-rename-form"
                      onSubmit={(event) => rename(event, item.id)}
                    >
                      <label htmlFor={`resume-name-${item.id}`}>
                        File name
                      </label>
                      <div>
                        <input
                          id={`resume-name-${item.id}`}
                          value={editedName}
                          maxLength={176}
                          required
                          autoFocus
                          onChange={(event) =>
                            setEditedName(event.currentTarget.value)
                          }
                        />
                        <button
                          className="primary-button"
                          disabled={pending}
                          type="submit"
                        >
                          Save
                        </button>
                        <button
                          className="secondary-button"
                          disabled={pending}
                          type="button"
                          onClick={() => setEditingId("")}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <h3>{item.fileName}</h3>
                  )}
                  <p>
                    {Math.ceil(Number(item.size) / 1024)} KB · Uploaded{" "}
                    {new Intl.DateTimeFormat("en", {
                      dateStyle: "medium",
                    }).format(new Date(item.createdAt))}
                  </p>
                </div>
                <div className="resume-item-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      setEditingId(item.id);
                      setEditedName(item.fileName.replace(/\.pdf$/i, ""));
                    }}
                  >
                    <Pencil aria-hidden="true" />
                    Rename
                  </button>
                  {!item.selected && (
                    <button
                      className="secondary-button"
                      type="button"
                      disabled={pending}
                      onClick={() => select(item.id)}
                    >
                      Use publicly
                    </button>
                  )}
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={pending}
                    aria-pressed={viewId === item.id}
                    onClick={() => setViewId(item.id)}
                  >
                    <FileText aria-hidden="true" />
                    {viewId === item.id ? "Viewing" : "View PDF"}
                  </button>
                  <button
                    className="danger-button"
                    type="button"
                    disabled={pending}
                    onClick={() => remove(item)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="manage-panel">
            <p>No résumés uploaded yet.</p>
          </div>
        )}
        {viewId && (
          <div className="manage-panel resume-viewer">
            <div className="panel-heading">
              <h3>PDF preview</h3>
              <a
                className="secondary-button"
                href={`/api/manage/resumes?view=${encodeURIComponent(viewId)}`}
                target="_blank"
                rel="noreferrer"
              >
                Open in new tab
              </a>
            </div>
            <iframe
              key={viewId}
              src={`/api/manage/resumes?view=${encodeURIComponent(viewId)}`}
              title={`PDF preview of ${initial.find((item) => item.id === viewId)?.fileName ?? "résumé"}`}
            />
          </div>
        )}
      </section>
    </>
  );
}
