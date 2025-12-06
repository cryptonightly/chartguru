import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Enhanced Prisma Client configuration for production environments
// This helps with connection pooling and error handling on platforms like Hostinger
const createPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL;
  
  // Log connection status in development (helpful for debugging)
  if (process.env.NODE_ENV === 'development') {
    console.log('Database connection:', databaseUrl ? 'Configured' : 'Missing DATABASE_URL');
  }
  
  // Configure Prisma Client with connection pooling and timeout settings
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// In production, we don't reuse the global instance to avoid connection issues
// This is important for platforms like Hostinger that may have different runtime behavior
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown handler
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

