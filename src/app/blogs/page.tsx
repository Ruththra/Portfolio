import type { Metadata } from "next";
import Link from "next/link";
import { plannedTopics, publishedBlogs } from "@/features/blog/blog.data";
import { EmptyState } from "@/components/ui/EmptyState";
export const metadata: Metadata = {
  title: "Blog",
  description:
    "Writing about full-stack engineering, AI, data science, and creative development.",
};
export default function BlogsPage() {
  return (
    <div className="page-shell">
      <p className="eyebrow">FIELD NOTES</p>
      <h1>Blog</h1>
      <p className="page-lead">
        Exploring the ideas, decisions, and lessons behind engineering and
        creative work.
      </p>
      {publishedBlogs.length ? (
        <div className="project-grid">
          {publishedBlogs.map((post) => (
            <Link
              className="project-card"
              href={`/blogs/${post.slug}`}
              key={post.slug}
            >
              <span>{post.readingTime}</span>
              <h2>{post.title}</h2>
              <p>{post.summary}</p>
            </Link>
          ))}
        </div>
      ) : (
        <>
          <EmptyState
            title="Writing in progress"
            copy="No placeholder is presented as a published article. Fresh notes will arrive when they are ready."
          />
          <div className="planned">
            <h2>Planned topic areas</h2>
            <ul>
              {plannedTopics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
