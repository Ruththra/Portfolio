import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogs, getBlog } from "@/features/blog/blog.data";
export const dynamicParams = false;
export function generateStaticParams() {
  return blogs.filter((p) => p.published).map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const post = getBlog((await params).slug);
  return post ? { title: post.title, description: post.summary } : {};
}
export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = getBlog((await params).slug);
  if (!post) notFound();
  return (
    <article className="page-shell article">
      <p className="eyebrow">{post.readingTime}</p>
      <h1>{post.title}</h1>
      <p className="page-lead">{post.summary}</p>
      {post.body.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </article>
  );
}
