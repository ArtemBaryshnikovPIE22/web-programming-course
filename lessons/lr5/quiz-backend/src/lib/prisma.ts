import { PrismaClient } from '@prisma/client'

declare global {
  // Чтобы избежать повторного создания PrismaClient при HMR / hot reload
  // @ts-ignore
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma