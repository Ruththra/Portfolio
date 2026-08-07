"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ResumeItem = {
  id: string;
  fileName: string;
  mimeType: string;
  size: string;
  selected: boolean;
  createdAt: Date;
};

export function ResumeManager({
  initial,
  configured,
}: {
  initial: ResumeItem[];
  configured: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(
    configured
      ? ""
      : "Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable résumé storage.",
  );

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/manage/resumes", {
        method: "POST",
        body: new FormData(form),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(result.message ?? "Upload failed.");
        return;
      }
      form.reset();
      setMessage("Résumé uploaded.");
      router.refresh();
    } catch {
      setMessage("Network error. The résumé was not uploaded.");
    } finally {
      setPending(false);
    }
  }

  async function select(id: string) {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/manage/resumes", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = (await response.json()) as { message?: string };
      setMessage(
        response.ok
          ? "Public résumé selection updated."
          : (result.message ?? "Selection failed."),
      );
      if (response.ok) router.refresh();
    } catch {
      setMessage("Network error. The selection was not changed.");
    } finally {
      setPending(false);
    }
  }

  async function remove(item: ResumeItem) {
    if (!confirm(`Delete ${item.fileName}? This cannot be undone.`)) return;
    setPending(true);
    setMessage("");
    try {
      const response = await fetch(`/api/manage/resumes?id=${item.id}`, {
        method: "DELETE",
      });
      let errorMessage = "Delete failed.";
      if (!response.ok) {
        const result = (await response.json()) as { message?: string };
        errorMessage = result.message ?? errorMessage;
      }
      setMessage(response.ok ? "Résumé deleted." : errorMessage);
      if (response.ok) router.refresh();
    } catch {
      setMessage("Network error. The résumé was not deleted.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <form className="manage-panel resume-upload" onSubmit={upload}>
        <h2>Upload résumé</h2>
        <p>
          PDF only, up to 10 MB. The first upload is selected automatically.
        </p>
        <label>
          PDF file
          <input
            name="file"
            type="file"
            accept="application/pdf,.pdf"
            disabled={!configured || pending}
            required
          />
        </label>
        {message && (
          <p className="form-alert" role="status">
            {message}
          </p>
        )}
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
                  <h3>{item.fileName}</h3>
                  <p>
                    {Math.ceil(Number(item.size) / 1024)} KB · Uploaded{" "}
                    {new Intl.DateTimeFormat("en", {
                      dateStyle: "medium",
                    }).format(new Date(item.createdAt))}
                  </p>
                </div>
                <div className="resume-item-actions">
                  {!item.selected && (
                    <button
                      className="secondary-button"
                      disabled={pending}
                      onClick={() => select(item.id)}
                    >
                      Use publicly
                    </button>
                  )}
                  <button
                    className="danger-button"
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
      </section>
    </>
  );
}
