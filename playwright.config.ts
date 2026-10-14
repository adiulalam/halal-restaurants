import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: '100%',
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 800 }
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: [
    {
      command: 'npx expo start --web --port 8081',
      cwd: 'apps/mobile-kfc',
      url: 'http://localhost:8081/',
      reuseExistingServer: true,
      timeout: 120000
    },
    {
      command: 'npx expo start --web --port 8082',
      cwd: 'apps/mobile-nandos',
      url: 'http://localhost:8082/',
      reuseExistingServer: true,
      timeout: 120000
    }
  ]
});

