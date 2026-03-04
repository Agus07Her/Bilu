import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

let connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || '';

// Forzar sslmode=no-verify en producción para evitar errores de certificado auto-firmado
if (process.env.NODE_ENV === 'production' && connectionString && !connectionString.includes('sslmode=')) {
    connectionString += connectionString.includes('?') ? '&sslmode=no-verify' : '?sslmode=no-verify';
}

const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
    adapter: process.env.NODE_ENV === 'production' ? adapter : undefined
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
