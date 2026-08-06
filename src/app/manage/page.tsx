import Link from "next/link";
import { listAllPosts } from "@/features/blog/blog.repository";
export default async function Dashboard() {
  const posts = await listAllPosts();
  const published = posts.filter((p) => p.status === "published").length;
  return (
    <>
      <header className="manage-header">
        <div>
          <p className="eyebrow">WORKSPACE</p>
          <h1>Overview</h1>
          <p>Manage your portfolio and publishing workflow.</p>
        </div>
        <Link className="primary-button" href="/manage/blogs/new">
          Create post
        </Link>
      </header>
      <section className="stat-grid" aria-label="Blog statistics">
        {[
          ["Total blogs", posts.length],
          ["Published", published],
          ["Drafts", posts.length - published],
        ].map(([label, value]) => (
          <article className="stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>
      <section className="manage-panel">
        <div className="panel-heading">
          <h2>Recently updated</h2>
          <Link href="/manage/blogs">View all</Link>
        </div>
        {posts.length ? (
          <ul className="recent-list">
            {posts.slice(0, 5).map((post) => (
              <li key={post.id}>
                <Link href={`/manage/blogs/${post.id}/edit`}>{post.title}</Link>
                <span>
                  {new Intl.DateTimeFormat("en", {
                    dateStyle: "medium",
                  }).format(post.updatedAt)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No posts yet. Create your first draft when you’re ready.</p>
        )}
      </section>
      <div className="quick-grid">
        <Link className="manage-panel" href="/manage/blogs/new">
          <h2>Write a blog post</h2>
          <p>Start in draft and publish when it is ready.</p>
        </Link>
        <Link className="manage-panel" href="/manage/content">
          <h2>Edit portfolio content</h2>
          <p>Update homepage copy and public details.</p>
        </Link>
      </div>
    </>
  );
}
