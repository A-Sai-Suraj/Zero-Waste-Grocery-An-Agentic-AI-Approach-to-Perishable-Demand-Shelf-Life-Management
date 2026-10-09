import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prismaOptions = env.databaseUrl
  ? { datasources: { db: { url: env.databaseUrl } } }
  : undefined;

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaOptions);

if (env.nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
