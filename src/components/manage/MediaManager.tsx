"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
type MediaItem = {
  id: string;
  url: string;
  alt: string;
  mimeType: string;
  size: string;
};
export function MediaManager({
  initial,
  configured,
}: {
  initial: MediaItem[];
  configured: boolean;
}) {
  const router = useRouter();
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState(
    configured
      ? ""
      : "Uploads are unavailable until BLOB_READ_WRITE_TOKEN is configured.",
  );
  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const file = form.get("file");
    if (file instanceof File) setPreview(URL.createObjectURL(file));
    const response = await fetch("/api/manage/media", {
      method: "POST",
      body: form,
    });
    const result = (await response.json()) as { message?: string };
    setMessage(
      response.ok ? "Image uploaded." : (result.message ?? "Upload failed."),
    );
    if (response.ok) {
      e.currentTarget.reset();
      router.refresh();
    }
  }
  async function remove(id: string) {
    if (
      !confirm(
        "Delete this media item? Existing content using its URL may break.",
      )
    )
      return;
    const response = await fetch(`/api/manage/media?id=${id}`, {
      method: "DELETE",
    });
    setMessage(response.ok ? "Media deleted." : "Delete failed.");
    if (response.ok) router.refresh();
  }
  return (
    <>
      <form className="manage-panel media-upload" onSubmit={upload}>
        <h2>Upload image</h2>
        <p>JPEG, PNG, WebP, or AVIF. Maximum 5 MB.</p>
        <label>
          Image
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            disabled={!configured}
            required
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
          />
        </label>
        <label>
          Alternative text
          <input name="alt" disabled={!configured} required />
        </label>
        {preview && (
          <Image
            className="media-preview"
            src={preview}
            alt="Selected image preview"
            width={640}
            height={400}
            unoptimized
          />
        )}
        {message && (
          <p className="form-alert" role="status">
            {message}
          </p>
        )}
        <button className="primary-button" disabled={!configured}>
          Upload
        </button>
      </form>
      <section className="media-grid">
        {initial.map((item) => (
          <article className="manage-panel" key={item.id}>
            <Image src={item.url} alt={item.alt} width={640} height={400} />
            <p>{item.alt}</p>
            <small>
              {item.mimeType} · {Math.ceil(Number(item.size) / 1024)} KB
            </small>
            <button className="danger-button" onClick={() => remove(item.id)}>
              Delete
            </button>
          </article>
        ))}
      </section>
    </>
  );
}
