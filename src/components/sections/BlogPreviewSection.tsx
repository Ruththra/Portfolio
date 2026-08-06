import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { publishedBlogs } from "@/features/blog/blog.data";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
export function BlogPreview() {
  return (
    <section className="section">
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
          {publishedBlogs.slice(0, 3).map((post) => (
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
    </section>
  );
}
