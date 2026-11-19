import { expect, signIn, test } from './support/test'

test('the theme toggle switches between light and dark', async ({ page }) => {
  await signIn(page)
  const root = page.locator('html')
  await expect(root).not.toHaveClass(/dark/)

  await page.getByRole('button', { name: 'Toggle theme' }).click()
  await expect(root).toHaveClass(/dark/)

  await page.getByRole('button', { name: 'Toggle theme' }).click()
  await expect(root).not.toHaveClass(/dark/)
})

test('the locale picker switches the interface to French', async ({ page }) => {
  await signIn(page)

  await page.getByRole('button', { name: 'Select language' }).click()
  await page.getByRole('menuitem', { name: 'Français' }).click()

  await expect(page.getByRole('link', { name: 'Utilisateurs' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Users' })).toBeHidden()
})
