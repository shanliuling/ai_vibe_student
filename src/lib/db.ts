import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// 这个文件创建一个 Prisma 客户端并将其附加到全局对象上，这样你的应用中只会创建一个客户端实例。
// 这有助于解决在开发模式下使用 Prisma ORM 时可能出现的热装填问题 Next.js。

const globalForPrisma = global as unknown as {
  prisma: PrismaClient
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
