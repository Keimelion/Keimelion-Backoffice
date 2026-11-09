import { vi } from 'vitest'

const API_VERSION_PREFIX = '/v1'
const TEST_ORIGIN = 'http://localhost'

type HttpMethodName = 'get' | 'post' | 'patch' | 'delete'

export interface ApiMockRequest {
  url: string
  params: Record<string, string>
  data: BodyInit | null
  headers: Record<string, string>
}

type MockReply = readonly [status: number, body?: unknown]
type MockResponder = (request: ApiMockRequest) => MockReply | Promise<MockReply>

interface MockRoute {
  method: HttpMethodName
  path: string
  responder: MockResponder | 'network-error'
}

export interface ApiMockRouteBuilder {
  reply: (statusOrResponder: number | MockResponder, body?: unknown) => void
  networkError: () => void
}

export interface ApiMock {
  onGet: (path: string) => ApiMockRouteBuilder
  onPost: (path: string) => ApiMockRouteBuilder
  onPatch: (path: string) => ApiMockRouteBuilder
  onDelete: (path: string) => ApiMockRouteBuilder
  history: Record<HttpMethodName, ApiMockRequest[]>
  restore: () => void
}

export function createApiMock(): ApiMock {
  const routes: MockRoute[] = []
  const history: Record<HttpMethodName, ApiMockRequest[]> = {
    get: [],
    post: [],
    patch: [],
    delete: [],
  }

  function buildRoute(method: HttpMethodName, path: string): ApiMockRouteBuilder {
    return {
      reply: (statusOrResponder, body) => {
        const responder: MockResponder =
          typeof statusOrResponder === 'function'
            ? statusOrResponder
            : () => [statusOrResponder, body]
        routes.push({ method, path, responder })
      },
      networkError: () => {
        routes.push({ method, path, responder: 'network-error' })
      },
    }
  }

  vi.stubGlobal('fetch', async (url: string, init: RequestInit): Promise<Response> => {
    const method = (init.method ?? 'GET').toLowerCase() as HttpMethodName
    const parsedUrl = new URL(url, TEST_ORIGIN)
    const path = parsedUrl.pathname.replace(API_VERSION_PREFIX, '')
    const request: ApiMockRequest = {
      url,
      params: Object.fromEntries(parsedUrl.searchParams.entries()),
      data: init.body ?? null,
      headers: Object.fromEntries(new Headers(init.headers).entries()),
    }
    history[method].push(request)
    const route = routes.findLast(
      (candidate) => candidate.method === method && candidate.path === path,
    )
    if (route === undefined)
      return toJsonResponse(404, {
        code: 'NOT_FOUND',
        message: `No mock for ${path}`,
        metadata: {},
      })
    if (route.responder === 'network-error') throw new TypeError('Failed to fetch')
    const [status, body] = await route.responder(request)
    return toJsonResponse(status, body)
  })

  return {
    onGet: (path) => buildRoute('get', path),
    onPost: (path) => buildRoute('post', path),
    onPatch: (path) => buildRoute('patch', path),
    onDelete: (path) => buildRoute('delete', path),
    history,
    restore: () => {
      vi.unstubAllGlobals()
    },
  }
}

export function apiErrorBody(code: string, message: string): Record<string, unknown> {
  return { code, message, metadata: {} }
}

function toJsonResponse(status: number, body: unknown): Response {
  const responseBody = body === undefined ? null : JSON.stringify(body)
  return new Response(status === 204 ? null : responseBody, {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
