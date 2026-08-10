import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { listPublishedPosts } from "@/features/blog/blog.repository";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Pagination } from "@/components/ui/Pagination";
import { paginate } from "@/lib/pagination";
export async function BlogPreview({ page }: { page?: string | string[] }) {
  const allPublishedBlogs = await listPublishedPosts();
  const {
    items: publishedBlogs,
    page: currentPage,
    totalPages,
  } = paginate(allPublishedBlogs, page);
  return (
    <section id="blog" className="section">
      <div className="heading-row">
        <SectionHeading
          eyebrow="NOTES & IDEAS"
          title="From the Blog"
          intro="Learning notes and considered perspectives from the intersection of engineering, data, and design."
        />
        <Link href="/blogs">
          Visit blog <ArrowUpRight />
        </Link>
      </div>
      {publishedBlogs.length ? (
        <div>
          {publishedBlogs.map((post) => (
            <Link key={post.slug} href={`/blogs/${post.slug}`}>
              {post.title}
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Writing in progress"
          copy="Thoughtful articles are taking shape behind the scenes. Planned topics are visible in the blog archive."
        />
      )}
      {publishedBlogs.length > 0 && (
        <Pagination
          basePath="/"
          currentPage={currentPage}
          totalPages={totalPages}
          pageParam="blogPage"
          hash="blog"
        />
      )}
    </section>
  );
}
