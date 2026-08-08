"use client";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { PortfolioContent } from "@/features/content/content.schema";
export function ContentEditor({ initial }: { initial: PortfolioContent }) {
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const field = <K extends keyof PortfolioContent>(
    key: K,
    value: PortfolioContent[K],
  ) => setForm((old) => ({ ...old, [key]: value }));
  const updateRole = (index: number, value: string) =>
    field(
      "heroRoles",
      form.heroRoles.map((role, roleIndex) =>
        roleIndex === index ? value : role,
      ),
    );
  const addRole = () => field("heroRoles", [...form.heroRoles, "New role"]);
  const removeRole = (index: number) =>
    field(
      "heroRoles",
      form.heroRoles.filter((_, roleIndex) => roleIndex !== index),
    );
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/manage/content", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = (await response.json()) as
        PortfolioContent | { message?: string };
      if (response.ok && "heroHeading" in result) setForm(result);
      setMessage(
        response.ok
          ? "Portfolio content saved."
          : (("message" in result ? result.message : undefined) ??
              "Unable to save."),
      );
    } catch {
      setMessage("Network error. Changes were not saved.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form className="manage-panel editor-form" onSubmit={save}>
      <label>
        Hero heading
        <input
          value={form.heroHeading}
          onChange={(e) => field("heroHeading", e.target.value)}
        />
      </label>
      <label>
        Hero introduction
        <textarea
          rows={4}
          value={form.heroIntroduction}
          onChange={(e) => field("heroIntroduction", e.target.value)}
        />
      </label>
      <fieldset className="role-editor">
        <legend>Hero roles</legend>
        <p>Add or edit the professional roles shown on the homepage.</p>
        <div className="role-editor-list">
          {form.heroRoles.map((role, index) => (
            <div className="role-editor-row" key={index}>
              <label>
                <span className="sr-only">Role {index + 1}</span>
                <input
                  value={role}
                  maxLength={60}
                  onChange={(event) => updateRole(index, event.target.value)}
                />
              </label>
              <button
                type="button"
                className="danger-button role-remove"
                aria-label={`Remove role ${index + 1}`}
                disabled={form.heroRoles.length === 1}
                onClick={() => removeRole(index)}
              >
                <Trash2 aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="secondary-button role-add"
          disabled={form.heroRoles.length >= 8}
          onClick={addRole}
        >
          <Plus aria-hidden="true" />
          Add role
        </button>
      </fieldset>
      <label>
        About text (blank lines create paragraphs)
        <textarea
          rows={10}
          value={form.aboutText}
          onChange={(e) => field("aboutText", e.target.value)}
        />
      </label>
      <div className="form-grid">
        <label>
          Public email
          <input
            type="email"
            value={form.email}
            onChange={(e) => field("email", e.target.value)}
          />
        </label>
        <label>
          Location
          <input
            value={form.location}
            onChange={(e) => field("location", e.target.value)}
          />
        </label>
      </div>
      <div className="form-grid">
        <label>
          LinkedIn URL
          <input
            type="text"
            inputMode="url"
            placeholder="linkedin.com/in/username"
            value={form.linkedin}
            onChange={(e) => field("linkedin", e.target.value)}
          />
        </label>
        <label>
          GitHub URL
          <input
            type="text"
            inputMode="url"
            placeholder="github.com/username"
            value={form.github}
            onChange={(e) => field("github", e.target.value)}
          />
        </label>
        <label>
          Instagram URL
          <input
            type="text"
            inputMode="url"
            placeholder="instagram.com/username"
            value={form.instagram}
            onChange={(e) => field("instagram", e.target.value)}
          />
        </label>
      </div>
      <label>
        Default SEO description
        <textarea
          rows={3}
          value={form.seoDescription}
          onChange={(e) => field("seoDescription", e.target.value)}
        />
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={form.showRemoteAvailability}
          onChange={(e) => field("showRemoteAvailability", e.target.checked)}
        />{" "}
        Show “Open to remote opportunities” on the public site
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={form.showBlog}
          onChange={(e) => field("showBlog", e.target.checked)}
        />{" "}
        Show blogs on the public site
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={form.showProjects}
          onChange={(e) => field("showProjects", e.target.checked)}
        />{" "}
        Show projects on the public site
      </label>
      {message && (
        <p className="form-alert" role="status">
          {message}
        </p>
      )}
      <button className="primary-button" disabled={pending}>
        {pending ? "Saving…" : "Save content"}
      </button>
    </form>
  );
}
