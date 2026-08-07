import { describe, expect, it } from "vitest";
import { blogInputSchema, slugify } from "@/features/blog/blog.schema";
import { safeReturnUrl } from "@/features/auth/auth.utils";
import {
  portfolioContentSchema,
  portfolioVisibilitySchema,
} from "@/features/content/content.schema";
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
  it("validates both public visibility controls", () => {
    expect(
      portfolioVisibilitySchema.safeParse({
        showBlog: false,
        showProjects: true,
      }).success,
    ).toBe(true);
    expect(portfolioContentSchema.safeParse({ showBlog: true }).success).toBe(
      false,
    );
  });
  it("normalizes social links entered without a protocol", () => {
    const result = portfolioContentSchema.safeParse({
      heroHeading: "Portfolio owner",
      heroIntroduction: "A sufficiently long portfolio introduction.",
      aboutText: "A sufficiently long description for the about section.",
      email: "owner@example.com",
      location: "Colombo",
      linkedin: "linkedin.com/in/owner",
      github: "github.com/owner",
      instagram: "instagram.com/owner",
      showBlog: true,
      showProjects: true,
      seoDescription:
        "A sufficiently long default description for search engine previews.",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.linkedin).toBe("https://linkedin.com/in/owner");
    expect(result.data.github).toBe("https://github.com/owner");
    expect(result.data.instagram).toBe("https://instagram.com/owner");
  });
});
