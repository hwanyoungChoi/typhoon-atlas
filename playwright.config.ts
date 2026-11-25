import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  // vitest·node --test 의 *.test, *.spec 과 겹치지 않게 한다.
  testMatch: "**/*.e2e.ts",
  use: { baseURL: "http://localhost:3000" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
});
