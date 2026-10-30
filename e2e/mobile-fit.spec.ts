import { expect, test } from "@playwright/test";

test.use({
  baseURL: process.env.MOBILE_TEST_URL ?? "http://127.0.0.1:3000",
  isMobile: true,
  hasTouch: true,
});

for (const width of [320, 390, 767]) {
  test(`mobile content and contact form fit at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 740 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".menu-button")).toBeVisible();
    const panel = await page.locator(".technology-panel").boundingBox();
    expect(panel).not.toBeNull();
    expect(panel!.x).toBeGreaterThanOrEqual(0);
    expect(panel!.x + panel!.width).toBeLessThanOrEqual(width);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(width);
    const dialog = page.getByRole("dialog", { name: "Let’s Connect" });
    await expect(async () => {
      if (!(await dialog.isVisible())) {
        await page
          .getByRole("button", { name: "Get in Touch", exact: true })
          .click();
      }
      await expect(dialog).toBeVisible();
    }).toPass({ timeout: 15000 });
    const input = dialog.locator('input[name="name"]');
    await expect(input).toHaveCSS("font-size", "16px");
    await input.fill("Mobile visitor");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
}

test("navigation remains reachable in phone landscape", async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const menu = page.getByRole("dialog", { name: "Navigation menu" });
  await expect(async () => {
    if (!(await menu.isVisible())) {
      await page.getByRole("button", { name: "Open navigation menu" }).click();
    }
    await expect(menu).toBeVisible();
  }).toPass({ timeout: 15000 });
  const lastLink = menu.getByRole("link").last();
  await lastLink.scrollIntoViewIfNeeded();
  await expect(lastLink).toBeInViewport();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
});
