import { expect, test } from "@playwright/test";

test("지도 화면이 뜬다", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("canvas.maplibregl-canvas")).toBeVisible();
});

test("선택한 태풍의 요약과 경로 출처가 보인다", async ({ page }) => {
  await page.goto("/?year=2019&storm=JMA-1929-2019");
  const summary = page.getByRole("region", { name: "선택한 태풍 요약" });
  await expect(summary).toContainText("29호 판폰");
  await expect(summary).toContainText("970");
  await expect(summary).toContainText("베스트트랙");
});
