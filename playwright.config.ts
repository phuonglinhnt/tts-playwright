import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined, // <--- THÊM DÒNG NÀY ĐỂ TRÁNH XUNG ĐỘT DATABASE TRÊN CI
  reporter: "html",
  use: {
    baseURL: "http://localhost:4000",
    testIdAttribute: "data-test",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm ci && npm start",
    cwd: "./tiem-nha-test",
    url: "http://localhost:4000/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
