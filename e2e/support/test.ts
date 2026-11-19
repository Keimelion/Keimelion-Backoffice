import { test as base, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { ADMIN_CREDENTIALS } from './api-fixtures'
import { mockApi } from './mock-api'
import type { MockApi } from './mock-api'

interface SmokeFixtures {
  api: MockApi
}

export const test = base.extend<SmokeFixtures>({
  api: [
    async ({ page }, use): Promise<void> => {
      const api = await mockApi(page)
      await use(api)
      expect(api.unhandledRequests, 'API calls without an e2e mock').toEqual([])
    },
    { auto: true },
  ],
})

export { expect }

export async function signIn(page: Page): Promise<void> {
  await page.goto('/login')
  await page.getByLabel('Email').fill(ADMIN_CREDENTIALS.email)
  await page.getByLabel('Password', { exact: true }).fill(ADMIN_CREDENTIALS.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL('/')
}
