import { BlogsManageView } from "@/components/manage/BlogsManageView";
import {
  filterAndSortPosts,
  getBlogCategories,
  type BlogManagementQuery,
} from "@/features/blog/blog-management";
import { listAllPosts } from "@/features/blog/blog.repository";
import { getPortfolioContent } from "@/features/content/content.repository";

export default async function BlogsManagePage({
  searchParams,
}: {
  searchParams: Promise<BlogManagementQuery>;
}) {
  const [query, content, allPosts] = await Promise.all([
    searchParams,
    getPortfolioContent(),
    listAllPosts(),
  ]);

  return (
    <BlogsManageView
      categories={getBlogCategories(allPosts)}
      posts={filterAndSortPosts(allPosts, query)}
      query={query}
      visibility={{
        showBlog: content.showBlog,
        showProjects: content.showProjects,
      }}
    />
  );
}
