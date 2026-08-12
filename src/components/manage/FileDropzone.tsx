"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type FileDropzoneProps = {
  accept: string;
  description: string;
  icon: ReactNode;
  name: string;
  title: string;
  disabled?: boolean;
  maxFiles?: number;
  multiple?: boolean;
  required?: boolean;
};

export function FileDropzone({
  accept,
  description,
  icon,
  name,
  title,
  disabled = false,
  maxFiles = 1,
  multiple = false,
  required = false,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  useEffect(() => {
    const input = inputRef.current;
    const form = input?.form;
    if (!form) return;

    const clearSelection = () => setSelectedFiles([]);
    form.addEventListener("reset", clearSelection);
    return () => form.removeEventListener("reset", clearSelection);
  }, []);

  function updateSelection(files: readonly File[]) {
    setSelectedFiles(files.map((file) => file.name));
  }

  function selectDroppedFiles(files: FileList) {
    const input = inputRef.current;
    if (!input || disabled) return;

    const transfer = new DataTransfer();
    const selected = Array.from(files).slice(0, multiple ? maxFiles : 1);
    selected.forEach((file) => transfer.items.add(file));
    input.files = transfer.files;
    updateSelection(selected);
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  return (
    <label
      className={["project-dropzone", dragging && "is-dragging"]
        .filter(Boolean)
        .join(" ")}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        selectDroppedFiles(event.dataTransfer.files);
      }}
    >
      <span className="project-dropzone-icon" aria-hidden="true">
        {icon}
      </span>
      <strong aria-live="polite">
        {selectedFiles.length
          ? multiple
            ? `${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"} selected`
            : selectedFiles[0]
          : title}
      </strong>
      <span>{description}</span>
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        required={required}
        disabled={disabled}
        onChange={(event) =>
          updateSelection(Array.from(event.currentTarget.files ?? []))
        }
      />
    </label>
  );
}
