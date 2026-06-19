import { PrismaClient } from "@prisma/client";

// Handle legacy dev database URL on Hostinger
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("file:./dev.db")) {
  console.warn("⚠️  WARNING: Old dev database URL detected. Using Hostinger MySQL instead.");
  process.env.DATABASE_URL = "mysql://u465666297_u465666297:Doctor1346790@localhost:3306/u465666297_u465666297";
}

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  const errorMsg = "❌ ERROR: DATABASE_URL environment variable is not set. Cannot start server.";
  console.error(errorMsg);
  throw new Error(errorMsg);
}

// Validate it's a MySQL connection string
if (!process.env.DATABASE_URL.startsWith("mysql://")) {
  const errorMsg = `❌ ERROR: DATABASE_URL must start with 'mysql://'. Got: ${process.env.DATABASE_URL.substring(0, 30)}...`;
  console.error(errorMsg);
  throw new Error(errorMsg);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  console.log("🔌 Creating Prisma Client...");
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


