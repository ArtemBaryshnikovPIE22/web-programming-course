import { describe, it, expect } from 'vitest'
import { 
  githubCallbackSchema, 
  startSessionSchema, 
  answerSchema, 
  gradeSchema, 
  questionSchema 
} from './validation'

describe('Validation Schemas Unit Tests', () => {
  const validCuid = 'cjld2cjxh0000qzrmn831i7rn'

  describe('startSessionSchema', () => {
    it('should pass with a valid cuid', () => {
      const result = startSessionSchema.safeParse({ userId: validCuid })
      expect(result.success).toBe(true)
    })

    it('should fail with an invalid cuid format', () => {
      const result = startSessionSchema.safeParse({ userId: 'invalid-id-123' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Некорректный формат userId')
      }
    })
  })

  describe('answerSchema (Edge Cases)', () => {
    it('should accept array of strings (multiple-select)', () => {
      const data = { questionId: validCuid, userAnswer: ['choice1', 'choice2'] }
      expect(answerSchema.safeParse(data).success).toBe(true)
    })

    it('should accept array of numbers (essay grades)', () => {
      const data = { questionId: validCuid, userAnswer: [10, 8, 9] }
      expect(answerSchema.safeParse(data).success).toBe(true)
    })

    it('should reject if questionId is not a cuid', () => {
      const data = { questionId: '123', userAnswer: 'test' }
      expect(answerSchema.safeParse(data).success).toBe(false)
    })
  })

  describe('gradeSchema', () => {
    it('should fail if any grade is negative', () => {
      const data = {
        grades: [5, -1],
        rubric: {
          maxPoints: 10,
          criteria: [{ name: 'Test', maxPoints: 10 }]
        }
      }
      expect(gradeSchema.safeParse(data).success).toBe(false)
    })

    it('should fail if rubric has no criteria (min 1)', () => {
      const data = {
        grades: [5],
        rubric: { maxPoints: 10, criteria: [] }
      }
      const result = gradeSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Нужен хотя бы один критерий')
      }
    })
  })

  describe('questionSchema Defaults', () => {
    it('should use default value of 1 for points', () => {
      const data = {
        text: 'Valid Question Text',
        type: 'essay',
        categoryId: validCuid
      }
      const result = questionSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.points).toBe(1)
      }
    })
  })
})
describe('Validation Negative Cases', () => {
  
  describe('gradeSchema Negative', () => {
    it('should fail if maxPoints is negative', () => {
      const badData = {
        grades: [5],
        rubric: { maxPoints: -10, criteria: [{ name: 'Test', maxPoints: 5 }] }
      }
      const result = gradeSchema.safeParse(badData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Максимальный балл должен быть положительным')
      }
    })

    it('should fail if criterion name is empty', () => {
      const badData = {
        grades: [1],
        rubric: { maxPoints: 10, criteria: [{ name: '', maxPoints: 5 }] }
      }
      const result = gradeSchema.safeParse(badData)
      expect(result.success).toBe(false)
    })
  })

  describe('answerSchema Negative', () => {
    it('should fail if userAnswer is a boolean (invalid type)', () => {
      const result = answerSchema.safeParse({
        questionId: 'cjld2cjxh0000qzrmn831i7rn',
        userAnswer: true // Не разрешено в z.union
      })
      expect(result.success).toBe(false)
    })
  })

  describe('questionSchema Negative', () => {
    it('should fail if type is not in enum', () => {
      const result = questionSchema.safeParse({
        text: 'Valid text length',
        type: 'true-false-invalid',
        categoryId: 'cjld2cjxh0000qzrmn831i7rn'
      })
      expect(result.success).toBe(false)
    })
  })
})