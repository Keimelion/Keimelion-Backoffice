import { ITEM_DETAIL_RESPONSE } from './support/api-fixtures'
import { expect, signIn, test } from './support/test'

test('expanding an item row opens its detail with sources', async ({ page }) => {
  const { item } = ITEM_DETAIL_RESPONSE
  await signIn(page)
  await page.getByRole('link', { name: 'Items' }).click()

  await page.getByRole('cell', { name: item.name, exact: true }).click()

  await expect(page.getByText('Add source')).toBeVisible()
})
