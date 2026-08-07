import Link from "next/link";
import type { BlogRecord } from "@/db/schema";
import type { BlogManagementQuery } from "@/features/blog/blog-management";
import { VisibilityToggle } from "./VisibilityToggle";

type BlogsManageViewProps = {
  categories: string[];
  posts: BlogRecord[];
  query: BlogManagementQuery;
  visibility: {
    showBlog: boolean;
    showProjects: boolean;
  };
};

const updatedDateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

export function BlogsManageView({
  categories,
  posts,
  query,
  visibility,
}: BlogsManageViewProps) {
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
      <VisibilityToggle target="blogs" initial={visibility} />
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
          {categories.map((category) => (
            <option key={category}>{category}</option>
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
                    {updatedDateFormatter.format(post.updatedAt)}
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
