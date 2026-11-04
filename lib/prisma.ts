import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const hasDatabaseUrl = Boolean(
  process.env.DATABASE_URL &&
  process.env.DATABASE_URL.trim().length > 0 &&
  !process.env.DATABASE_URL.includes('user:password@localhost')
);

