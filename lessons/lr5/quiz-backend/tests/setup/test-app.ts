import app from '../../src/index'

export function createTestApp() {
  return app
}

export async function request(endpoint: string, options?: RequestInit) {
  const response = await app.request(endpoint, options)
  const body = await response.json().catch(() => null)
  return { response, body }
}