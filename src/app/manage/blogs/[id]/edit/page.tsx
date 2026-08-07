import { notFound } from "next/navigation";
import { BlogEditor } from "@/components/manage/BlogEditor";
import { getPost } from "@/features/blog/blog.repository";
export default async function EditBlogPage({
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
          <p className="eyebrow">BLOG</p>
          <h1>Edit post</h1>
        </div>
      </header>
      <BlogEditor
        post={{
          ...post,
          status: post.status === "published" ? "published" : "draft",
          coverImageAlt: post.coverImageAlt ?? "",
          seoTitle: post.seoTitle ?? "",
          seoDescription: post.seoDescription ?? "",
        }}
      />
    </>
  );
}
