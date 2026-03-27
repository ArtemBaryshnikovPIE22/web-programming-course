import { PrismaClient } from '@prisma/client'
import { beforeAll, afterAll } from 'vitest'

const prisma = new PrismaClient()

export async function cleanDatabase() {
  await prisma.$transaction([
    prisma.answer.deleteMany(),
    prisma.session.deleteMany(),
    prisma.question.deleteMany(),
    prisma.category.deleteMany(),
    prisma.user.deleteMany(),
  ])
}

export async function createTestData() {
  const user = await prisma.user.create({
    data: {
      githubId: 'test_github_123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'student'
    }
  })

  const admin = await prisma.user.create({
    data: {
      githubId: 'test_github_456',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin'
    }
  })

  const category = await prisma.category.create({
    data: {
      name: 'Test Category',
      slug: 'test-category'
    }
  })

  const question = await prisma.question.create({
    data: {
      text: 'Test question?',
      type: 'multiple-select',
      categoryId: category.id,
      correctAnswer: JSON.stringify(['A', 'B']),
      points: 1
    }
  })

  return { user, admin, category, question }
}

beforeAll(async () => {
  await cleanDatabase()
})

afterAll(async () => {
  await prisma.$disconnect()
})