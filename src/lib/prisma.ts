import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

let connectionString =
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    '';

// Supabase/Vercel: Si estamos en producción, forzamos sslmode=no-verify
// Eliminamos cualquier sslmode previo para que no haya conflictos
if (process.env.NODE_ENV === 'production' && connectionString) {
    if (connectionString.includes('sslmode=')) {
        connectionString = connectionString.replace(/sslmode=[^&?]+/, 'sslmode=no-verify');
    } else {
        connectionString += connectionString.includes('?') ? '&sslmode=no-verify' : '?sslmode=no-verify';
    }
}

console.log('Ambiente:', process.env.NODE_ENV);
console.log('SSL Configurado:', process.env.NODE_ENV === 'production');

const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
    adapter: process.env.NODE_ENV === 'production' ? adapter : undefined,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
