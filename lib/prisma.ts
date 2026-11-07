import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Android / Termux uses arm64 with bionic libc which lacks official prebuilt Prisma query engine binaries.
const isAndroidArm64 = process.platform === 'android';

function createSafePrisma(): PrismaClient {
  if (isAndroidArm64) {
    // Return a dummy proxy to prevent native binary dlopen crashes on Termux
    return new Proxy({} as any, {
      get: (_target, prop) => {
        if (prop === '$connect' || prop === '$disconnect') {
          return async () => {};
        }
        return new Proxy({} as any, {
          get: () => async () => null,
        });
      },
    });
  }

  try {
    return (
      globalForPrisma.prisma ||
      new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      })
    );
  } catch {
    return new Proxy({} as any, {
      get: () => new Proxy({} as any, { get: () => async () => null }),
    });
  }
}

export const prisma = createSafePrisma();

if (process.env.NODE_ENV !== 'production' && !isAndroidArm64) {
  globalForPrisma.prisma = prisma;
}

export const hasDatabaseUrl = Boolean(
  !isAndroidArm64 &&
  process.env.DATABASE_URL &&
  process.env.DATABASE_URL.trim().length > 0 &&
  !process.env.DATABASE_URL.includes('user:password@localhost')
);

