import { expect, test } from "@playwright/test";

test("홈 화면이 지도와 함께 열린다", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Typhoon Atlas/);
  await expect(page.locator("canvas.maplibregl-canvas")).toBeVisible();
});
