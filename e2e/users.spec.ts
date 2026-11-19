import { USERS_LIST_RESPONSE } from './support/api-fixtures'
import { expect, signIn, test } from './support/test'

test('the users list shows every account returned by the API', async ({ page }) => {
  await signIn(page)
  await page.getByRole('link', { name: 'Users' }).click()

  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible()
  for (const user of USERS_LIST_RESPONSE.items) {
    await expect(page.getByRole('cell', { name: user.email, exact: true })).toBeVisible()
  }
})
