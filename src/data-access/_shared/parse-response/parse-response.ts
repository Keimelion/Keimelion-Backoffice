import type { AxiosResponse } from 'axios'
import type { ZodType } from 'zod'
import { ApiRequestError } from '@/data-access/_shared/api-error'

export function parseApiResponse<T>(
  schema: ZodType<T>,
  response: AxiosResponse<unknown>,
  context: string,
): T {
  const parsed = schema.safeParse(response.data)
  if (!parsed.success) {
    throw new ApiRequestError(
      'INVALID_RESPONSE',
      `The server returned an unexpected ${context} payload.`,
      response.status,
    )
  }
  return parsed.data
}
