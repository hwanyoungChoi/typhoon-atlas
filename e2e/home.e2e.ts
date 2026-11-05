import { expect, test } from "@playwright/test";

test("지도 화면이 뜬다", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("canvas.maplibregl-canvas")).toBeVisible();
});
