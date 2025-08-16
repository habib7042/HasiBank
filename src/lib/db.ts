import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Validate DATABASE_URL before creating client
const validateDatabaseUrl = () => {
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  
  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    throw new Error(`Invalid DATABASE_URL format. Must start with postgresql:// or postgres://. Got: ${databaseUrl.substring(0, 20)}...`)
  }
  
  return databaseUrl
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    datasources: {
      db: {
        url: validateDatabaseUrl()
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db