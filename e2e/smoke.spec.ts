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
  await page.waitForLoadState("networkidle");
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

test("desktop avatar stays pinned through the page", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.waitForFunction(
    () =>
      document.querySelector<HTMLVideoElement>(".avatar-video")?.readyState !==
      HTMLMediaElement.HAVE_NOTHING,
  );

  const avatar = page.locator(".avatar-stage");
  const skills = page.locator("#skills");

  await expect(page.locator(".pin-spacer")).toHaveCount(1);
  await page.evaluate(() => window.scrollTo(0, 1400));
  await expect(avatar).toBeInViewport();
  await expect(skills).toBeInViewport();

  const avatarBox = await avatar.boundingBox();
  const skillsContentBox = await page.locator(".technology-panel").boundingBox();
  expect(avatarBox).not.toBeNull();
  expect(skillsContentBox).not.toBeNull();
  expect(skillsContentBox!.x + skillsContentBox!.width).toBeLessThanOrEqual(
    avatarBox!.x,
  );
  expect(avatarBox!.y + avatarBox!.height).toBeLessThan(
    page.viewportSize()!.height,
  );

  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expect(avatar).toBeInViewport();
  const contactContentBox = await page.locator(".contact-grid").boundingBox();
  const pinnedAvatarBox = await avatar.boundingBox();
  expect(contactContentBox).not.toBeNull();
  expect(pinnedAvatarBox).not.toBeNull();
  expect(contactContentBox!.x + contactContentBox!.width).toBeLessThanOrEqual(
    pinnedAvatarBox!.x,
  );
});
