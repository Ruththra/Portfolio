import { describe, expect, it } from "vitest";
import { blogInputSchema, slugify } from "@/features/blog/blog.schema";
import { safeReturnUrl } from "@/features/auth/auth.utils";
describe("management security", () => {
  it("prevents open redirects", () => {
    expect(safeReturnUrl("https://evil.example")).toBe("/manage");
    expect(safeReturnUrl("//evil.example/manage")).toBe("/manage");
    expect(safeReturnUrl("/manage/blogs")).toBe("/manage/blogs");
  });
  it("normalizes slugs", () =>
    expect(slugify("Stored <script>alert(1)</script>")).toBe(
      "stored-script-alert-1-script",
    ));
  it("requires image alt text", () => {
    const result = blogInputSchema.safeParse({
      title: "Valid post",
      slug: "valid-post",
      excerpt: "This excerpt is long enough.",
      content: "# Safe Markdown",
      coverImage: "https://example.com/a.jpg",
      coverImageAlt: "",
      authorName: "Admin",
      category: "Notes",
      tags: [],
      status: "published",
      featured: false,
      seoTitle: "",
      seoDescription: "",
      canonicalUrl: "",
      socialImage: "",
    });
    expect(result.success).toBe(false);
  });
});
