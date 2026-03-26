// src/services/scoringService.test.ts
import { describe, it, expect } from 'vitest'
import { scoringService } from './scoringService.js'

describe('scoringService', () => {
  describe('scoreMultipleSelect', () => {

    it('должен вычесть баллы за неправильные ответы', () => {
      const correct = ['a', 'b', 'c']
      const student = ['a', 'b', 'd']
      
      const score = scoringService.scoreMultipleSelect(correct, student)
      
      expect(score).toBe(1.5) // 2 правильных (+2) - 1 неправильный (-0.5) = 1.5
    })

    it('не должен уйти в минус', () => {
      const correct = ['a', 'b']
      const student = ['c', 'd', 'e']
      
      const score = scoringService.scoreMultipleSelect(correct, student)
      
      expect(score).toBe(0) // min 0
    })

    it('должен игнорировать дубликаты в ответах', () => {
      const correct = ['a', 'b', 'c']
      const student = ['a', 'a', 'b', 'b', 'c']
      
      const score = scoringService.scoreMultipleSelect(correct, student)
      
      expect(score).toBe(3)
    })

    it('должен вернуть 0 если нет правильных ответов', () => {
      const correct = ['a', 'b']
      const student: string[] = []
      
      const score = scoringService.scoreMultipleSelect(correct, student)
      
      expect(score).toBe(0)
    })

    it('должен корректно обрабатывать пустые массивы', () => {
      expect(scoringService.scoreMultipleSelect([], [])).toBe(0)
      expect(scoringService.scoreMultipleSelect(['a'], [])).toBe(0)
      expect(scoringService.scoreMultipleSelect([], ['a'])).toBe(0)
    })
  })

  describe('scoreEssay', () => {
    const rubric = {
      maxPoints: 10,
      criteria: [
        { name: 'Содержание', maxPoints: 5 },
        { name: 'Структура', maxPoints: 3 },
        { name: 'Язык', maxPoints: 2 }
      ]
    }

    it('должен выбросить ошибку если оценка превышает максимум критерия', () => {
      const grades = [6, 2, 1]
      
      expect(() => {
        scoringService.scoreEssay(grades, rubric)
      }).toThrow('Оценка по критерию "Содержание" не может превышать 5')
    })

    it('должен выбросить ошибку если оценка отрицательная', () => {
      const grades = [4, -1, 1]
      
      expect(() => {
        scoringService.scoreEssay(grades, rubric)
      }).toThrow('Оценка не может быть отрицательной')
    })

    it('не должен превышать максимальный балл', () => {
      const grades = [5, 3, 2] // Последний критерий максимум 2
      
      const score = scoringService.scoreEssay(grades, rubric)
      
      expect(score).toBe(10) // 5+3+2=10, а не 11
    })

    it('должен работать с максимальными оценками', () => {
      const grades = [5, 3, 2]
      
      const score = scoringService.scoreEssay(grades, rubric)
      
      expect(score).toBe(10)
    })

    it('должен обрабатывать разные рубрики', () => {
      const customRubric = {
        maxPoints: 15,
        criteria: [
          { name: 'Критерий 1', maxPoints: 10 },
          { name: 'Критерий 2', maxPoints: 5 }
        ]
      }
      
      expect(scoringService.scoreEssay([8, 4], customRubric)).toBe(12)
      expect(scoringService.scoreEssay([10, 5], customRubric)).toBe(15)
    })
  })
})