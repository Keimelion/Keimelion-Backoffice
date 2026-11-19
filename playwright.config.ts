import { defineConfig, devices } from '@playwright/test'

const BASE_URL = 'http://localhost:3001'
const isCi = process.env.CI !== undefined

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 1 : 0,
  reporter: isCi ? [['github'], ['list']] : 'list',
  use: {
    baseURL: BASE_URL,
    locale: 'en-US',
    colorScheme: 'light',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run start',
    url: `${BASE_URL}/login`,
    reuseExistingServer: !isCi,
  },
})
