import { defineConfig, devices } from '@playwright/test'

const frontendPort = Number(process.env.FRONTEND_PORT ?? 5173)
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${frontendPort}`

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm --prefix ../frontend run dev -- --host 127.0.0.1 --port ${frontendPort}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
