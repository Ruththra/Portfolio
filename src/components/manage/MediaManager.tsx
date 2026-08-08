"use client";
import {
  CheckCircle2,
  CircleAlert,
  ImageUp,
  Info,
  LoaderCircle,
  Trash2,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
type MediaItem = {
  id: string;
  url: string;
  alt: string;
  mimeType: string;
  size: string;
  selectedAvatar: boolean;
};
type Notification = {
  message: string;
  type: "success" | "error" | "info";
};
export function MediaManager({
  initial,
  configured,
}: {
  initial: MediaItem[];
  configured: boolean;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(
    configured
      ? null
      : {
          message: "Uploads are unavailable until media storage is configured.",
          type: "info",
        },
  );
  function notify(message: string, type: Notification["type"]) {
    setNotification({ message, type });
  }
  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formElement = e.currentTarget;
    const form = new FormData(formElement);
    if (!selectedFile) {
      notify("Choose or drop an image first.", "error");
      return;
    }
    setUploading(true);
    setNotification(null);
    try {
      form.set("file", selectedFile);
      const response = await fetch("/api/manage/media", {
        method: "POST",
        body: form,
      });
      const result = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      notify(
        response.ok ? "Image uploaded." : (result.message ?? "Upload failed."),
        response.ok ? "success" : "error",
      );
      if (response.ok) {
        formElement.reset();
        setSelectedFile(null);
        setPreview("");
        router.refresh();
      }
    } catch {
      notify("Network error. The image was not uploaded.", "error");
    } finally {
      setUploading(false);
    }
  }
  function chooseFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify("Please choose an image file.", "error");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setNotification(null);
  }
  function receiveDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
    if (!configured) return;

    const file = Array.from(event.dataTransfer.files).find((item) =>
      item.type.startsWith("image/"),
    );
    if (!file) {
      notify("Drop a JPEG, PNG, WebP, or AVIF image.", "error");
      return;
    }

    chooseFile(file);
    if (fileInputRef.current) {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      fileInputRef.current.files = transfer.files;
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
    const result = response.ok
      ? null
      : ((await response.json()) as { message?: string });
    notify(
      response.ok ? "Media deleted." : (result?.message ?? "Delete failed."),
      response.ok ? "success" : "error",
    );
    if (response.ok) router.refresh();
  }
  async function selectAvatar(id: string) {
    const response = await fetch("/api/manage/media", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = (await response.json()) as { message?: string };
    notify(
      response.ok
        ? "Homepage avatar updated."
        : (result.message ?? "Avatar selection failed."),
      response.ok ? "success" : "error",
    );
    if (response.ok) router.refresh();
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
          ) : notification.type === "error" ? (
            <CircleAlert aria-hidden="true" />
          ) : (
            <Info aria-hidden="true" />
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
      <form className="manage-panel media-upload" onSubmit={upload}>
        <h2>Upload image</h2>
        <p>JPEG, PNG, WebP, or AVIF. Maximum 5 MB.</p>
        <div
          className={`media-dropzone ${dragging ? "is-dragging" : ""}`}
          role="button"
          tabIndex={configured ? 0 : -1}
          aria-disabled={!configured}
          aria-label="Choose or drop an image to upload"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (configured) setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.stopPropagation();
            event.dataTransfer.dropEffect = "copy";
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            )
              setDragging(false);
          }}
          onDrop={receiveDrop}
        >
          <ImageUp aria-hidden="true" />
          <span className="media-dropzone-title">
            {selectedFile ? selectedFile.name : "Drop an image here"}
          </span>
          <span>or click to browse</span>
        </div>
        <input
          ref={fileInputRef}
          className="media-file-input"
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={!configured}
          aria-label="Image file"
          onChange={(event) => chooseFile(event.target.files?.[0])}
        />
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
        <button
          className="primary-button media-upload-button"
          disabled={!configured || uploading}
        >
          {uploading && (
            <LoaderCircle className="upload-spinner" aria-hidden="true" />
          )}
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </form>
      <section className="media-grid">
        {initial.map((item) => (
          <article className="manage-panel" key={item.id}>
            <Image
              src={item.url}
              alt={item.alt}
              width={640}
              height={400}
              quality={90}
            />
            <p>{item.alt}</p>
            <small>
              {item.mimeType} · {Math.ceil(Number(item.size) / 1024)} KB
            </small>
            <div className="media-actions">
              <button
                className={
                  item.selectedAvatar ? "primary-button" : "secondary-button"
                }
                disabled={item.selectedAvatar}
                onClick={() => selectAvatar(item.id)}
              >
                {item.selectedAvatar ? "Current avatar" : "Use as avatar"}
              </button>
              <button className="danger-button" onClick={() => remove(item.id)}>
                <Trash2 aria-hidden="true" />
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
