import { expect, test } from "@playwright/test";
test("homepage and anchors render", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Ruththiragayan Sutharsan/i }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Skills" }).first().click();
  await expect(
    page.getByRole("heading", { name: "Skills & Technologies" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "About" }).first().click();
  await expect(page.getByRole("heading", { name: "About Me" })).toBeVisible();
});
test("archive routes work", async ({ page }) => {
  await page.goto("/projects");
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  await page.goto("/blogs");
  await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
});
test("mobile menu and invalid contact", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: /open navigation/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Send Message" }).click();
  await expect(
    page.getByText(/Please enter at least 2 characters/),
  ).toBeVisible();
});
test("reduced motion does not pin hero", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
});
