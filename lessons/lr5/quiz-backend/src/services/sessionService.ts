import { PrismaClient } from '@prisma/client'
import { scoringService } from './scoringService.js'

const prisma = new PrismaClient()

export interface SubmitAnswerInput {
  sessionId: string
  questionId: string
  userAnswer: any // JSON данные
}

export class SessionService {

  async submitAnswer(data: SubmitAnswerInput) {
    return await prisma.$transaction(async (tx) => {
      // 1. Проверяем сессию
      const session = await tx.session.findUnique({
        where: { id: data.sessionId },
        include: { user: true }
      })

      if (!session) {
        throw new Error('Сессия не найдена')
      }

      if (session.status !== 'in_progress') {
        throw new Error('Сессия уже завершена или истекла')
      }

      if (session.expiresAt < new Date()) {
        await tx.session.update({
          where: { id: data.sessionId },
          data: { status: 'expired' }
        })
        throw new Error('Время сессии истекло')
      }

      // 2. Проверяем вопрос
      const question = await tx.question.findUnique({
        where: { id: data.questionId }
      })

      if (!question) {
        throw new Error('Вопрос не найден')
      }

      // 3. Проверяем, не отвечали ли уже на этот вопрос
      const existingAnswer = await tx.answer.findUnique({
        where: {
          sessionId_questionId: {
            sessionId: data.sessionId,
            questionId: data.questionId
          }
        }
      })

      if (existingAnswer) {
        throw new Error('Ответ на этот вопрос уже был отправлен')
      }

      // 4. Вычисляем баллы (для автоматически проверяемых типов)
      let score: number | null = null
      let isCorrect: boolean | null = null

      if (question.type === 'multiple-select') {
        score = scoringService.scoreQuestion(
          'multiple-select',
          question.correctAnswer ? JSON.parse(question.correctAnswer) : [],
          data.userAnswer
        )
        isCorrect = score > 0
      }
      // Для essay score остается null до проверки админом

      // 5. Сохраняем ответ
      const answer = await tx.answer.create({
        data: {
          sessionId: data.sessionId,
          questionId: data.questionId,
          userAnswer: JSON.stringify(data.userAnswer),
          score,
          isCorrect
        }
      })

      return answer
    })
  }

  async submitSession(sessionId: string) {
    return await prisma.$transaction(async (tx) => {
      const session = await tx.session.findUnique({
        where: { id: sessionId },
        include: { 
          answers: {
            include: { question: true }
          }
        }
      })

      if (!session) {
        throw new Error('Сессия не найдена')
      }

      if (session.status !== 'in_progress') {
        throw new Error('Сессия уже завершена или истекла')
      }

      // Вычисляем общий балл (только по автоматически проверенным ответам)
      const totalScore = session.answers.reduce((sum, answer) => {
        return sum + (answer.score || 0)
      }, 0)

      // Обновляем сессию
      const updatedSession = await tx.session.update({
        where: { id: sessionId },
        data: {
          status: 'completed',
          score: totalScore,
          completedAt: new Date()
        }
      })

      return updatedSession
    })
  }

  async getSessionWithAnswers(sessionId: string, userId: string) {
const session = await prisma.session.findUnique({
  where: { id: sessionId },
  include: {
    user: true,
    answers: {
      include: {
        question: true
      }
    }
  }
})

if (!session) throw new Error('Сессия не найдена')
if (session.user.id !== userId) throw new Error('Нет доступа к этой сессии')

return session
}
}

export const sessionService = new SessionService()