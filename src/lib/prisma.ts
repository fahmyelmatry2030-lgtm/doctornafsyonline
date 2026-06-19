import { PrismaClient } from "@prisma/client";

// Validate DATABASE_URL before creating client
if (!process.env.DATABASE_URL) {
  const errorMsg = "ERROR: DATABASE_URL environment variable is not set. Cannot start server.";
  console.error(errorMsg);
  throw new Error(errorMsg);
}

// Validate it's a MySQL connection string
if (!process.env.DATABASE_URL.startsWith("mysql://")) {
  const errorMsg = `ERROR: DATABASE_URL must start with 'mysql://'. Got: ${process.env.DATABASE_URL.substring(0, 30)}...`;
  console.error(errorMsg);
  throw new Error(errorMsg);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  console.log("🔌 Creating Prisma Client for Hostinger...");
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" 
      ? ["query", "error", "warn"] 
      : ["error", "warn"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}


