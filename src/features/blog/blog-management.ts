import type { BlogRecord } from "@/db/schema";

export type BlogManagementQuery = {
  q?: string;
  status?: string;
  category?: string;
  sort?: string;
};

export function filterAndSortPosts(
  allPosts: BlogRecord[],
  query: BlogManagementQuery,
) {
  let posts = allPosts;

  if (query.q) {
    const search = query.q.toLowerCase();
    posts = posts.filter((post) =>
      `${post.title} ${post.excerpt}`.toLowerCase().includes(search),
    );
  }

  if (query.status === "draft" || query.status === "published") {
    posts = posts.filter((post) => post.status === query.status);
  }

  if (query.category) {
    posts = posts.filter((post) => post.category === query.category);
  }

  if (query.sort === "published") {
    posts = [...posts].sort(
      (a, b) =>
        (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0),
    );
  }

  return posts;
}

export function getBlogCategories(posts: BlogRecord[]) {
  return [...new Set(posts.map((post) => post.category))];
}
