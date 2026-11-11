import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4000',
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Tự động khởi động website Tiệm Nhà Test khi chạy test
  webServer: {
    command: 'npm run serve',
    cwd: '../tiem-nha-test',
    url: 'http://localhost:4000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
