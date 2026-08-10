import type { Metadata } from "next";
import Link from "next/link";
import { plannedTopics } from "@/features/blog/blog.data";
import { listPublishedPosts } from "@/features/blog/blog.repository";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { getPortfolioContent } from "@/features/content/content.repository";
import { notFound } from "next/navigation";
import { paginate } from "@/lib/pagination";
export const metadata: Metadata = {
  title: "Blog",
  description:
    "Writing about full-stack engineering, AI, data science, and creative development.",
};
export const dynamic = "force-dynamic";
export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  if (!(await getPortfolioContent()).showBlog) notFound();
  const allPublishedBlogs = await listPublishedPosts();
  const {
    items: publishedBlogs,
    page,
    totalPages,
  } = paginate(allPublishedBlogs, (await searchParams).page);
  return (
    <div className="page-shell">
      <p className="eyebrow">FIELD NOTES</p>
      <h1>Blog</h1>
      <p className="page-lead">
        Exploring the ideas, decisions, and lessons behind engineering and
        creative work.
      </p>
      {allPublishedBlogs.length ? (
        <>
          <div className="project-grid">
            {publishedBlogs.map((post) => (
              <Link
                className="project-card"
                href={`/blogs/${post.slug}`}
                key={post.slug}
              >
                <span>
                  {post.category} ·{" "}
                  {Math.max(
                    1,
                    Math.ceil(post.content.split(/\s+/).length / 220),
                  )}{" "}
                  min read
                </span>
                <h2>{post.title}</h2>
                <p>{post.excerpt}</p>
                <small>
                  {post.publishedAt
                    ? new Intl.DateTimeFormat("en", {
                        dateStyle: "long",
                      }).format(post.publishedAt)
                    : ""}
                </small>
              </Link>
            ))}
          </div>
          <Pagination
            basePath="/blogs"
            currentPage={page}
            totalPages={totalPages}
          />
        </>
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
