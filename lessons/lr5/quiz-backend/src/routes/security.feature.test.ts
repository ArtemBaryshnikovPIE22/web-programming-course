import { describe, it, expect, vi } from 'vitest'
import app from '../index'
import { prismaMock } from '../__mocks__/prisma'

vi.mock('../lib/prisma', () => ({
  prisma: prismaMock
}))

describe('Security & RBAC Feature Tests', () => {
  
  describe('Authentication (401)', () => {
    it('should return 401 if no token/cookie is provided', async () => {
      // Пытаемся зайти на защищенный роут без заголовков
      const res = await app.request('/api/sessions/my-results', {
        method: 'GET'
      })
      expect(res.status).toBe(401)
    })

    it('should return 401 for an invalid or expired token', async () => {
      const res = await app.request('/api/sessions/my-results', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer invalid-token' }
      })
      expect(res.status).toBe(401)
    })
  })

  describe('Authorization & Roles (403)', () => {
    it('should return 403 when a STUDENT tries to access ADMIN endpoint', async () => {
      // Мокаем пользователя с ролью STUDENT
      // Предположим, ваш authMiddleware записывает это в контекст или ищет в БД
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-std',
        role: 'STUDENT'
      } as any)

      // Пытаемся зайти на роут создания вопроса (только для админов)
      const res = await app.request('/api/admin/questions', {
        method: 'POST',
        headers: { 
          'Authorization': 'Bearer valid-student-token',
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ text: 'Admin question?' })
      })

      expect(res.status).toBe(403)
    })
  })

  describe('Payload Validation (400/422)', () => {
    it('should return 400 if request body is malformed JSON', async () => {
      const res = await app.request('/api/sessions/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ "invalid": json ' // Битый JSON
      })
      
      expect(res.status).toBe(400)
    })

    it('should return 400/422 when Zod validation fails in a route', async () => {
      const res = await app.request('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'not-a-cuid' })
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBeDefined()
    })
  })
})