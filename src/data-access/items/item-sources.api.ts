import type {
  AdminItemsCreateSourceRequestInput,
  AdminItemsUpdateSourceRequestInput,
  ItemSourceDetailParsed,
} from '@keimelion/sdk/schemas'
import { apiClient } from '@/data-access/_shared/client'

export async function createItemSource(
  itemId: string,
  input: AdminItemsCreateSourceRequestInput,
): Promise<ItemSourceDetailParsed> {
  const { source } = await apiClient.admin.items.createSource(itemId, input)
  return source
}

export async function updateItemSource(
  itemId: string,
  sourceId: string,
  input: AdminItemsUpdateSourceRequestInput,
): Promise<ItemSourceDetailParsed> {
  const { source } = await apiClient.admin.items.updateSource(itemId, sourceId, input)
  return source
}

export async function deleteItemSource(itemId: string, sourceId: string): Promise<void> {
  await apiClient.admin.items.deleteSource(itemId, sourceId)
}
