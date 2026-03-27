import { describe, it, expect, vi, beforeEach } from 'vitest'
import { scoringService } from './scoringService.js'

describe('ScoringService Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('scoreMultipleSelect', () => {
    it('should return full points if all correct answers are selected', () => {
      const correct = ['A', 'B']
      const student = ['A', 'B']
      expect(scoringService.scoreMultipleSelect(correct, student)).toBe(2)
    })

    it('should penalize for incorrect extra options (penalty -0.5)', () => {
      const correct = ['A', 'B']
      const student = ['A', 'B', 'C'] // C - лишний
      // 2 (за правильные) - 0.5 (за лишний) = 1.5
      expect(scoringService.scoreMultipleSelect(correct, student)).toBe(1.5)
    })

    it('should not return negative score (edge case)', () => {
      const correct = ['A']
      const student = ['X', 'Y', 'Z'] 
      // 0 - 1.5 = -1.5 -> должно быть 0
      expect(scoringService.scoreMultipleSelect(correct, student)).toBe(0)
    })

    it('should return 0 if student answers are empty', () => {
      expect(scoringService.scoreMultipleSelect(['A'], [])).toBe(0)
    })
  })

  describe('scoreEssay', () => {
    const mockRubric = {
      maxPoints: 10,
      criteria: [
        { name: 'Grammar', maxPoints: 5 },
        { name: 'Logic', maxPoints: 5 }
      ]
    }

    it('should sum up grades correctly', () => {
      const grades = [4, 3]
      expect(scoringService.scoreEssay(grades, mockRubric)).toBe(7)
    })

    it('should cap total score at rubric.maxPoints', () => {
      const grades = [5, 5]
      const smallMaxRubric = { ...mockRubric, maxPoints: 8 }
      // Сумма 10, но максимум 8
      expect(scoringService.scoreEssay(grades, smallMaxRubric)).toBe(8)
    })

    it('should throw error if grades count mismatch criteria', () => {
      expect(() => scoringService.scoreEssay([5], mockRubric)).toThrow(
        'Количество оценок должно соответствовать количеству критериев'
      )
    })

    it('should throw error if grade exceeds criterion maxPoints', () => {
      expect(() => scoringService.scoreEssay([6, 0], mockRubric)).toThrow(
        /не может превышать 5/
      )
    })
  })

  describe('scoreQuestion (Main Entry)', () => {
    it('should correctly route to single-select logic', () => {
      const score = scoringService.scoreQuestion('single-select', 'A', 'A')
      expect(score).toBe(1)
      const wrongScore = scoringService.scoreQuestion('single-select', 'A', 'B')
      expect(wrongScore).toBe(0)
    })

    it('should throw error for essay if rubric is missing', () => {
      expect(() => scoringService.scoreQuestion('essay', null, [5])).toThrow(
        'Для essay вопросов необходима рубрика оценивания'
      )
    })
  })
})