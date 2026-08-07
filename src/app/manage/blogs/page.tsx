import Link from "next/link";
import { listAllPosts } from "@/features/blog/blog.repository";
import { getPortfolioContent } from "@/features/content/content.repository";
import { VisibilityToggle } from "@/components/manage/VisibilityToggle";
export default async function BlogsManagePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    category?: string;
    sort?: string;
  }>;
}) {
  const query = await searchParams;
  const content = await getPortfolioContent();
  let posts = await listAllPosts();
  if (query.q)
    posts = posts.filter((p) =>
      `${p.title} ${p.excerpt}`.toLowerCase().includes(query.q!.toLowerCase()),
    );
  if (["draft", "published"].includes(query.status ?? ""))
    posts = posts.filter((p) => p.status === query.status);
  if (query.category)
    posts = posts.filter((p) => p.category === query.category);
  if (query.sort === "published")
    posts.sort(
      (a, b) =>
        (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0),
    );
  const categories = [
    ...new Set((await listAllPosts()).map((p) => p.category)),
  ];
  return (
    <>
      <header className="manage-header">
        <div>
          <p className="eyebrow">CONTENT</p>
          <h1>Blog posts</h1>
          <p>Search, filter, draft, and publish your writing.</p>
        </div>
        <Link className="primary-button" href="/manage/blogs/new">
          New post
        </Link>
      </header>
      <VisibilityToggle
        target="blogs"
        initial={{
          showBlog: content.showBlog,
          showProjects: content.showProjects,
        }}
      />
      <form className="filter-bar">
        <label>
          <span className="sr-only">Search posts</span>
          <input name="q" defaultValue={query.q} placeholder="Search posts" />
        </label>
        <select
          name="status"
          defaultValue={query.status ?? ""}
          aria-label="Filter status"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <select
          name="category"
          defaultValue={query.category ?? ""}
          aria-label="Filter category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={query.sort ?? "updated"}
          aria-label="Sort posts"
        >
          <option value="updated">Recently updated</option>
          <option value="published">Recently published</option>
        </select>
        <button className="secondary-button">Apply</button>
      </form>
      <section className="manage-panel">
        {posts.length ? (
          <div className="post-table">
            {posts.map((post) => (
              <article key={post.id}>
                <div>
                  <span className={`status ${post.status}`}>{post.status}</span>
                  <h2>
                    <Link href={`/manage/blogs/${post.id}/edit`}>
                      {post.title}
                    </Link>
                  </h2>
                  <p>
                    {post.category} · Updated{" "}
                    {new Intl.DateTimeFormat("en", {
                      dateStyle: "medium",
                    }).format(post.updatedAt)}
                  </p>
                </div>
                <Link
                  className="secondary-button"
                  href={`/manage/blogs/${post.id}/edit`}
                >
                  Edit
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p>No posts match these filters.</p>
        )}
      </section>
    </>
  );
}
