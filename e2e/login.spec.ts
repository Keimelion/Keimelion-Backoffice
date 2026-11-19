import { expect, signIn, test } from './support/test'

test('an admin signs in and lands on the dashboard', async ({ page }) => {
  await signIn(page)

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
})
