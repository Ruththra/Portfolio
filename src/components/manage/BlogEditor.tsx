"use client";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { slugify } from "@/features/blog/blog.schema";

type EditorPost = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  coverImageAlt: string;
  authorName: string;
  category: string;
  tags: string[];
  status: "draft" | "published";
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string | null;
  socialImage: string | null;
};
const empty: EditorPost = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: null,
  coverImageAlt: "",
  authorName: "Ruththiragayan Sutharsan",
  category: "Engineering",
  tags: [],
  status: "draft",
  featured: false,
  seoTitle: "",
  seoDescription: "",
  canonicalUrl: null,
  socialImage: null,
};
export function BlogEditor({ post = empty }: { post?: EditorPost }) {
  const router = useRouter();
  const [form, setForm] = useState(post);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(post.id));
  const [preview, setPreview] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [issues, setIssues] = useState<Record<string, string[]>>({});
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function field<K extends keyof EditorPost>(key: K, value: EditorPost[K]) {
    setForm((old) => ({ ...old, [key]: value }));
    setDirty(true);
  }
  async function save(status: "draft" | "published") {
    setPending(true);
    setMessage("");
    setIssues({});
    try {
      const response = await fetch(
        post.id ? `/api/manage/blogs/${post.id}` : "/api/manage/blogs",
        {
          method: post.id ? "PUT" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...form, status }),
        },
      );
      const result = (await response.json()) as EditorPost & {
        message?: string;
        issues?: Record<string, string[]>;
      };
      if (!response.ok) {
        setMessage(result.message ?? "Unable to save the post.");
        setIssues(result.issues ?? {});
        return;
      }
      setDirty(false);
      setMessage(status === "published" ? "Post published." : "Draft saved.");
      if (!post.id && result.id)
        router.replace(`/manage/blogs/${result.id}/edit`);
      router.refresh();
    } catch {
      setMessage("Network error. Your changes were not saved.");
    } finally {
      setPending(false);
    }
  }
  async function remove() {
    if (
      !post.id ||
      !window.confirm("Delete this post permanently? This cannot be undone.")
    )
      return;
    const response = await fetch(`/api/manage/blogs/${post.id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setDirty(false);
      router.push("/manage/blogs");
      router.refresh();
    } else setMessage("The post could not be deleted.");
  }
  const error = (name: string) =>
    issues[name]?.[0] ? (
      <span className="field-error">{issues[name][0]}</span>
    ) : null;
  return (
    <div className="editor-layout">
      <div className="manage-panel editor-form">
        <div className="editor-toolbar">
          <button
            type="button"
            className="secondary-button"
            onClick={() => setPreview((v) => !v)}
          >
            {preview ? "Edit" : "Preview"}
          </button>
          {post.id && (
            <a
              href={`/manage/blogs/${post.id}/preview`}
              target="_blank"
              rel="noreferrer"
            >
              Open secure preview
            </a>
          )}
          <span>{dirty ? "Unsaved changes" : "All changes saved"}</span>
        </div>
        {preview ? (
          <article className="markdown-preview">
            <h1>{form.title || "Untitled post"}</h1>
            <p>{form.excerpt}</p>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
            >
              {form.content}
            </ReactMarkdown>
          </article>
        ) : (
          <>
            <label>
              Title
              <input
                value={form.title}
                onChange={(e) => {
                  field("title", e.target.value);
                  if (!slugTouched) field("slug", slugify(e.target.value));
                }}
                required
              />
              {error("title")}
            </label>
            <label>
              Slug
              <input
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  field("slug", slugify(e.target.value));
                }}
                required
              />
              {error("slug")}
            </label>
            <label>
              Excerpt
              <textarea
                rows={3}
                value={form.excerpt}
                onChange={(e) => field("excerpt", e.target.value)}
              />
              {error("excerpt")}
            </label>
            <label>
              Content (Markdown)
              <textarea
                className="content-editor"
                rows={18}
                value={form.content}
                onChange={(e) => field("content", e.target.value)}
              />
              {error("content")}
            </label>
            <div className="form-grid">
              <label>
                Author
                <input
                  value={form.authorName}
                  onChange={(e) => field("authorName", e.target.value)}
                />
                {error("authorName")}
              </label>
              <label>
                Category
                <input
                  value={form.category}
                  onChange={(e) => field("category", e.target.value)}
                />
                {error("category")}
              </label>
            </div>
            <label>
              Tags (comma-separated)
              <input
                value={form.tags.join(", ")}
                onChange={(e) =>
                  field(
                    "tags",
                    e.target.value
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean),
                  )
                }
              />
            </label>
            <div className="form-grid">
              <label>
                Cover image URL
                <input
                  type="url"
                  value={form.coverImage ?? ""}
                  onChange={(e) => field("coverImage", e.target.value || null)}
                />
                {error("coverImage")}
              </label>
              <label>
                Cover image alternative text
                <input
                  value={form.coverImageAlt}
                  onChange={(e) => field("coverImageAlt", e.target.value)}
                />
                {error("coverImageAlt")}
              </label>
            </div>
            <label className="check">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => field("featured", e.target.checked)}
              />{" "}
              Feature this post
            </label>
            <details>
              <summary>Search and social metadata</summary>
              <label>
                SEO title
                <input
                  value={form.seoTitle}
                  onChange={(e) => field("seoTitle", e.target.value)}
                />
              </label>
              <label>
                SEO description
                <textarea
                  rows={3}
                  value={form.seoDescription}
                  onChange={(e) => field("seoDescription", e.target.value)}
                />
              </label>
              <label>
                Canonical URL
                <input
                  type="url"
                  value={form.canonicalUrl ?? ""}
                  onChange={(e) =>
                    field("canonicalUrl", e.target.value || null)
                  }
                />
              </label>
              <label>
                Social image URL
                <input
                  type="url"
                  value={form.socialImage ?? ""}
                  onChange={(e) => field("socialImage", e.target.value || null)}
                />
              </label>
            </details>
          </>
        )}
      </div>
      <aside className="manage-panel publish-panel">
        <h2>Publish</h2>
        <p>
          Status: <span className={`status ${form.status}`}>{form.status}</span>
        </p>
        {message && (
          <p className="form-alert" role="status">
            {message}
          </p>
        )}
        <button
          className="primary-button"
          disabled={pending}
          onClick={() => save("published")}
        >
          {pending ? "Saving…" : "Publish"}
        </button>
        <button
          className="secondary-button"
          disabled={pending}
          onClick={() => save("draft")}
        >
          {form.status === "published" ? "Unpublish" : "Save draft"}
        </button>
        {post.id && (
          <button className="danger-button" disabled={pending} onClick={remove}>
            <Trash2 aria-hidden="true" />
            Delete post
          </button>
        )}
      </aside>
    </div>
  );
}
