import { scoringService } from "./scoringService.js"
import { prisma } from "../lib/prisma.js"
import type { Prisma } from "@prisma/client"

// =========================
// =========================
export class SessionNotFoundError extends Error {
constructor() {
    super("Session not found")
}
}

export class SessionExpiredError extends Error {
constructor() {
    super("Session has expired")
}
}

export class SessionAlreadyCompletedError extends Error {
constructor() {
    super("Session already completed")
}
}

export class QuestionNotFoundError extends Error {
constructor() {
    super("Question not found")
}
}

export class DuplicateAnswerError extends Error {
constructor() {
    super("Answer already submitted for this question")
}
}

// =========================
// Utils
// =========================
function isStringArray(value: unknown): value is string[] {
return Array.isArray(value) && value.every((v) => typeof v === "string")
}

// =========================
// Service
// =========================
export class SessionService {
//
//
async createSession(
    userId: string,
    options?: { categoryId?: string; limit?: number; mode?: string }
) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
     const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

     const session = await tx.session.create({
        data: {
         userId,
         expiresAt,
         status: "in_progress",
        },
     })

     // фильтр
     const where: any = {}
     if (options?.categoryId) {
        where.categoryId = options.categoryId
     }

     const allQuestions = await tx.question.findMany({
        where,
        select: {
         id: true,
         text: true,
         type: true,
         points: true,
         categoryId: true,
        },
     })

     if (allQuestions.length === 0) {
        throw new QuestionNotFoundError()
     }

     // 🎲 random + limit
     let selected = allQuestions
     if (options?.limit && options.limit > 0) {
        selected = allQuestions
         .sort(() => 0.5 - Math.random())
         .slice(0, options.limit)
     }

     return {
        session,
        questions: selected,
        mode: options?.mode || "standard",
     }
    })
}

//
//
async getSession(sessionId: string, userId: string) {
    const session = await prisma.session.findUnique({
     where: { id: sessionId },
     include: {
        answers: {
         include: {
            question: {
             select: {
                id: true,
                text: true,
                type: true,
                points: true,
             },
            },
         },
        },
     },
    })

    if (!session || session.userId !== userId) {
     throw new SessionNotFoundError()
    }

    return session
}

//
//
async submitAnswer(
    sessionId: string,
    questionId: string,
    userAnswer: string | string[]
) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
     const session = await tx.session.findUnique({
        where: { id: sessionId },
     })

     if (!session) throw new SessionNotFoundError()
     if (session.status !== "in_progress") throw new SessionAlreadyCompletedError()
     if (session.expiresAt < new Date()) throw new SessionExpiredError()

     const question = await tx.question.findUnique({
        where: { id: questionId },
     })

     if (!question) throw new QuestionNotFoundError()

     let score: number | null = null
     let isCorrect: boolean | null = null

     //
     // 🔹 single-select
     //
     if (question.type === "single-select" && question.correctAnswer) {
        const correct = JSON.parse(question.correctAnswer) as string[]

        if (!Array.isArray(userAnswer)) {
         throw new Error("Invalid answer format")
        }

        isCorrect = correct[0] === userAnswer[0]
        score = isCorrect ? question.points : 0
     }

     



     // 🔹 multiple-select
     //
     if (question.type === "multiple-select") {
        if (!isStringArray(userAnswer)) {
         throw new Error("Invalid answer format")
        }

        const correct = JSON.parse(question.correctAnswer || "[]") as string[]

        const correctNumbers = correct.map(Number)
        const userNumbers = userAnswer.map(Number)

        score = scoringService.scoreMultipleSelect(correctNumbers, userNumbers)
        const correctSet = new Set(correct)
        const userSet = new Set(userAnswer)

        isCorrect =
         correctSet.size === userSet.size &&
         [...userSet].every((a) => correctSet.has(a))
     }

     // ✅ upsert вместо create (лучше UX)
     const answer = await tx.answer.upsert({
        where: {
         sessionId_questionId: { sessionId, questionId },
        },
        create: {
         sessionId,
         questionId,
         userAnswer: JSON.stringify(userAnswer),
         score,
         isCorrect,
        },
        update: {
         userAnswer: JSON.stringify(userAnswer),
         score,
         isCorrect,
        },
     })

     return answer
    })
}

//
// ✅ SUBMIT SESSION
//
async submitSession(sessionId: string) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
     const session = await tx.session.findUnique({
        where: { id: sessionId },
        include: { answers: true },
     })

     if (!session) throw new SessionNotFoundError()
     if (session.status !== "in_progress") throw new SessionAlreadyCompletedError()
     if (session.expiresAt < new Date()) throw new SessionExpiredError()

      const score = session.answers.reduce((sum, a) => {
      if (a.score === null) return sum
      return sum + a.score
      }, 0)

     return await tx.session.update({
        where: { id: sessionId },
        data: {
         status: "completed",
         score,
         completedAt: new Date(),
        },
     })
    })
}
}

export const sessionService = new SessionService()