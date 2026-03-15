import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

// Lazy initialization using a Proxy
// This prevents Prisma from initializing during Next.js static analysis 
// if no actual queries are made.
export const prisma = new Proxy({} as PrismaClientSingleton, {
  get(target, prop, receiver) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = prismaClientSingleton();
    }
    return Reflect.get(globalForPrisma.prisma, prop, receiver);
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = globalForPrisma.prisma;
