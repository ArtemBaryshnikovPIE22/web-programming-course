import { describe, it, expect, vi } from 'vitest'
import app from '../index'
import { prismaMock } from '../__mocks__/prisma'

vi.mock('../lib/prisma', () => ({
  prisma: prismaMock
}))

describe('Sessions Feature Tests', () => {
  const mockUserId = 'cjld2cjxh0000qzrmn831i7rn'

  describe('POST /sessions/start', () => {
    it('should create a new session for a valid user', async () => {
      // Имитируем, что пользователь существует
      prismaMock.user.findUnique.mockResolvedValue({ id: mockUserId, role: 'STUDENT' } as any)
      // Имитируем создание сессии
      prismaMock.session.create.mockResolvedValue({
        id: 'session-789',
        userId: mockUserId,
        status: 'ACTIVE'
      } as any)

      const res = await app.request('/api/sessions/start', {
        method: 'POST',
        body: JSON.stringify({ userId: mockUserId }),
        headers: { 'Content-Type': 'application/json' }
      })

      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body.sessionId).toBe('session-789')
    })

    it('should return 403 if user is not authorized to start session (Role Check)', async () => {
      // Имитируем пользователя с заблокированной ролью или специфическое ограничение
      prismaMock.user.findUnique.mockResolvedValue({ id: mockUserId, role: 'BANNED' } as any)

      const res = await app.request('/api/sessions/start', {
        method: 'POST',
        body: JSON.stringify({ userId: mockUserId }),
        headers: { 'Content-Type': 'application/json' }
      })

      // В зависимости от вашей реализации RBAC это может быть 403 или ошибка валидации
      expect(res.status).toBe(403)
    })
  })

  describe('POST /sessions/submit-answer', () => {
    it('should fail if questionId is not a valid CUID (Edge Case)', async () => {
      const res = await app.request('/api/sessions/submit-answer', {
        method: 'POST',
        body: JSON.stringify({
          questionId: 'short', // Не CUID
          userAnswer: 'A'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toContain('Некорректный формат questionId')
    })
  })
})