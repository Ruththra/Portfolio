import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { getPublishedPost } from "@/features/blog/blog.repository";
import { siteConfig } from "@/config/site";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const post = await getPublishedPost((await params).slug);
  if (!post) return {};
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    alternates: post.canonicalUrl
      ? { canonical: post.canonicalUrl }
      : undefined,
    openGraph: {
      type: "article",
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images:
        post.socialImage || post.coverImage
          ? [{ url: post.socialImage || post.coverImage! }]
          : undefined,
    },
  };
}
export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = await getPublishedPost((await params).slug);
  if (!post) notFound();
  const readingTime = Math.max(
    1,
    Math.ceil(post.content.split(/\s+/).length / 220),
  );
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Person", name: post.authorName },
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    image: post.coverImage ?? undefined,
    mainEntityOfPage: siteConfig.siteUrl
      ? `${siteConfig.siteUrl}/blogs/${post.slug}`
      : undefined,
  };
  return (
    <article className="page-shell article">
      <p className="eyebrow">
        {post.category} · {readingTime} min read
      </p>
      <h1>{post.title}</h1>
      <p className="page-lead">{post.excerpt}</p>
      <div className="article-meta">
        <span>By {post.authorName}</span>
        <time dateTime={post.publishedAt?.toISOString()}>
          {post.publishedAt
            ? new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(
                post.publishedAt,
              )
            : ""}
        </time>
      </div>
      {post.coverImage && (
        <Image
          className="blog-cover"
          src={post.coverImage}
          alt={post.coverImageAlt ?? ""}
          width={1200}
          height={630}
          priority
        />
      )}
      <div className="markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
        >
          {post.content}
        </ReactMarkdown>
      </div>
      <ul className="tag-list" aria-label="Tags">
        {post.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </article>
  );
}
