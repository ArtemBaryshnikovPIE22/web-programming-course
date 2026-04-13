import { z } from 'zod'

export const githubCallbackSchema = z.object({
  code: z.string().min(1, "Code is required")
})

export const SessionIdParamSchema = z.object({
  id: z.string().min(1),
});

export const AnswerSchema = z.object({  // для отправки ответа
  sessionId: z.string().optional(),
  questionId: z.string(),
  userAnswer: z.union([z.string(), z.array(z.string())]),
});

export const GradeSchema = z.object({  // для оценки эссе администратором
  answerId: z.string(),
  grades: z.array(z.number()).min(1, "At least one grade required"),
});

export const QuestionSchema = z.object({  // для создания/обновления вопроса
  text: z.string().min(1, "Question text is required"),
  type: z.enum(["single-select", "multiple-select", "essay"]),
  categoryId: z.string().min(1, "Category ID is required"),
  correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
  points: z.number().int().positive().default(1),
});

export const githubCodeSchema = z.object({
  code: z.string().min(1, "Code is required"),
});

export const createSessionSchema = z.object({
  categoryId: z.string().optional(),
});

export const answerSchema = z.object({
  questionId: z.string().min(1, "questionId is required"),
  userAnswer: z.array(z.string()).min(1, "userAnswer must not be empty"),
});

export const questionSchema = z.object({
  text: z.string().min(1),
  type: z.enum(["single-select", "multiple-select", "essay"]),
  categoryId: z.string().min(1),
  correctAnswer: z.array(z.string()).optional().nullable(),
  points: z.number().min(1).default(1),
});

export const updateQuestionSchema = z.object({
  text: z.string().min(1).optional(),
  type: z.enum(["single-select", "multiple-select", "essay"]).optional(),
  categoryId: z.string().min(1).optional(),
  correctAnswer: z.array(z.string()).optional().nullable(),
  points: z.number().min(1).optional(),
});

export const gradeSchema = z.object({
  grades: z.array(
    z.object({
      criterion: z.string(),
      points: z.number().min(0),
    })
  ),
  comment: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "slug must be lowercase with hyphens"),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export function toPrismaPage(pagination: { page: number; limit: number }) {
  return {
    skip: (pagination.page - 1) * pagination.limit,
    take: pagination.limit,
  };
}

export type GithubCallbackInput = z.infer<typeof githubCallbackSchema>
export type AnswerInput = z.infer<typeof AnswerSchema>
export type GradeInput = z.infer<typeof GradeSchema>
export type QuestionInput = z.infer<typeof QuestionSchema>