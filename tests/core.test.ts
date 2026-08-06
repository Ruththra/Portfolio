import { describe, expect, it } from "vitest";
import { contactSchema } from "@/features/contact/contact.schema";
import { hasUrl, typingFrame } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { getProject } from "@/features/projects/projects.data";
import { getBlog } from "@/features/blog/blog.data";

describe("core portfolio behavior", () => {
  it("types and holds Ruththra without layout-dependent values", () => {
    expect(typingFrame(0)).toBe("");
    expect(typingFrame(8 * 120)).toBe("Ruththra");
    expect(typingFrame(8 * 120 + 1000)).toBe("Ruththra");
  });
  it("validates contact input", () => {
    expect(
      contactSchema.safeParse({
        name: "R",
        email: "bad",
        subject: "",
        message: "short",
        website: "",
        startedAt: Date.now(),
      }).success,
    ).toBe(false);
    expect(
      contactSchema.safeParse({
        name: "Ruth",
        email: "r@example.com",
        subject: "Hello",
        message: "A message that is definitely long enough.",
        website: "",
        startedAt: Date.now(),
      }).success,
    ).toBe(true);
  });
  it("keeps navigation configuration intact", () => {
    expect(siteConfig.navigation.map((item) => item.label)).toEqual([
      "Home",
      "Skills",
      "About",
      "Contact",
    ]);
  });
  it("handles missing optional URLs and content", () => {
    expect(hasUrl("")).toBe(false);
    expect(hasUrl("https://example.com")).toBe(true);
    expect(hasUrl("javascript:alert(1)")).toBe(false);
    expect(hasUrl("not a URL")).toBe(false);
    expect(getProject("missing")).toBeUndefined();
    expect(getBlog("missing")).toBeUndefined();
  });
});
