import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = process.env.DATABASE_URL
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}
let prismaClient: PrismaClient | undefined

function createPrismaClient() {
  if (!connectionString) {
    throw new Error('Missing DATABASE_URL for Prisma')
  }

  const adapter = new PrismaPg({ connectionString })

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

export const prisma =
  globalForPrisma.prisma ??
  new Proxy(
    {},
    {
      get(_target, property) {
        prismaClient ??= createPrismaClient()

        if (process.env.NODE_ENV !== 'production') {
          globalForPrisma.prisma = prismaClient
        }

        return Reflect.get(prismaClient as object, property)
      },
    },
  ) as PrismaClient
