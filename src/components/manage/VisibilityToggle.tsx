"use client";

import { useState } from "react";

type Visibility = { showBlog: boolean; showProjects: boolean };

export function VisibilityToggle({
  initial,
  target,
}: {
  initial: Visibility;
  target: "blogs" | "projects";
}) {
  const key = target === "blogs" ? "showBlog" : "showProjects";
  const label = target === "blogs" ? "blogs" : "projects";
  const [visibility, setVisibility] = useState(initial);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const visible = visibility[key];

  async function toggle() {
    const next = { ...visibility, [key]: !visible };
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/manage/content", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!response.ok) throw new Error();
      setVisibility(next);
      setMessage(
        `${label[0].toUpperCase()}${label.slice(1)} are now ${next[key] ? "visible" : "hidden"}.`,
      );
    } catch {
      setMessage(`Unable to update ${label} visibility.`);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="visibility-control">
      <div>
        <strong>Public visibility</strong>
        <span className={`status ${visible ? "published" : "draft"}`}>
          {visible ? "Visible" : "Hidden"}
        </span>
      </div>
      <button
        type="button"
        className="secondary-button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={visible}
      >
        {pending ? "Updating…" : visible ? `Hide ${label}` : `Show ${label}`}
      </button>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
