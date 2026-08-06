import { BlogEditor } from "@/components/manage/BlogEditor";
export default function NewBlogPage() {
  return (
    <>
      <header className="manage-header">
        <div>
          <p className="eyebrow">BLOG</p>
          <h1>New post</h1>
        </div>
      </header>
      <BlogEditor />
    </>
  );
}
