import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({
    connectionString: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
    adapter: process.env.NODE_ENV === 'production' ? adapter : undefined
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
