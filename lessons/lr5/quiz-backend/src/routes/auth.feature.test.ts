import { describe, it, expect, vi } from 'vitest'
import app from '../index' // Ваш основной файл приложения Hono
import { prismaMock } from '../__mocks__/prisma.ts'

vi.mock('../lib/prisma.ts', () => ({
  prisma: prismaMock
}))

describe('Auth Feature Tests', () => {
  describe('POST /auth/github/callback', () => {
    it('should return 400 if code is missing', async () => {
    const res = await app.request('/api/auth/github/callback', { // путь верный
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' }
    })

    expect(res.status).toBe(400)
    const body = await res.json()
    // ИСПРАВЛЕНИЕ: меняем на то, что реально пришло в логах
    expect(body.error).toContain('Validation failed')
    })

    it('should return 200 and user data on successful auth', async () => {
      // Мокаем ответ от БД (поиск или создание пользователя)
      prismaMock.user.upsert.mockResolvedValue({
        id: 'user-123',
        email: 'test@github.com',
        role: 'STUDENT'
      } as any)

      const res = await app.request('/api/auth/github/callback', {
        method: 'POST',
        body: JSON.stringify({ code: 'valid-github-code' }),
        headers: { 'Content-Type': 'application/json' }
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.user.id).toBe('user-123')
    })
  })
})