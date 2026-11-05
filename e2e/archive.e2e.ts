import { expect, test } from "@playwright/test";

test("연도 페이지에 그해 경로 지도가 있다", async ({ page }) => {
  await page.goto("/typhoon/2022");
  await expect(page.locator(".track-map canvas")).toBeVisible();
  await expect(page.locator(".track-map figcaption")).toContainText("북서태평양 태풍");
});

test("한반도 접근 페이지에 최근접 지점 지도가 있다", async ({ page }) => {
  await page.goto("/korea");
  await expect(page.locator(".track-map canvas")).toBeVisible();
  await expect(page.locator(".track-map figcaption")).toContainText("가장 가까이 왔던 지점");
});
