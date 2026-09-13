import type { AxiosResponse } from 'axios'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import { parseApiResponse } from '@/data-access/_shared/parse-response'

const testSchema = z.object({ id: z.string(), count: z.number() })

function makeResponse(data: unknown, status = 200): AxiosResponse<unknown> {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {} as AxiosResponse['config'],
  }
}

describe('parseApiResponse', () => {
  it('returns validated data when the payload matches the schema', () => {
    const response = makeResponse({ id: 'abc', count: 3 })

    const result = parseApiResponse(testSchema, response, 'test')

    expect(result).toEqual({ id: 'abc', count: 3 })
  })

  it('throws ApiRequestError with INVALID_RESPONSE when the payload is malformed', () => {
    const response = makeResponse({ id: 'abc' }, 200)

    let thrown: unknown
    try {
      parseApiResponse(testSchema, response, 'test')
    } catch (error) {
      thrown = error
    }

    expect(thrown).toBeInstanceOf(ApiRequestError)
    expect(thrown).toMatchObject({
      code: 'INVALID_RESPONSE',
      status: 200,
      message: 'The server returned an unexpected test payload.',
    })
  })

  it('preserves the HTTP status of the response in the thrown error', () => {
    const response = makeResponse({ wrong: 'shape' }, 201)

    expect(() => parseApiResponse(testSchema, response, 'test')).toThrow(
      expect.objectContaining({ status: 201 }),
    )
  })
})
