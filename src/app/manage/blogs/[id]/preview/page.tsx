import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { getPost } from "@/features/blog/blog.repository";
export default async function DraftPreview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const post = await getPost((await params).id);
  if (!post) notFound();
  return (
    <>
      <header className="manage-header">
        <div>
          <p className="eyebrow">SECURE PREVIEW · {post.status}</p>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
        </div>
        <Link
          className="secondary-button"
          href={`/manage/blogs/${post.id}/edit`}
        >
          Back to editor
        </Link>
      </header>
      <article className="manage-panel markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
        >
          {post.content}
        </ReactMarkdown>
      </article>
    </>
  );
}
