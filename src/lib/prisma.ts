import { PrismaClient } from "@prisma/client";

// Auto-detect and handle database URL
if (!process.env.DATABASE_URL) {
  // Default to dev SQLite for local development
  if (process.env.NODE_ENV !== "production") {
    console.log("ℹ️  No DATABASE_URL found. Using SQLite for local development.");
    process.env.DATABASE_URL = "file:./prisma/dev.db";
  } else {
    console.warn("⚠️  DATABASE_URL is missing in environment variables. Ensure it is set.");
  }
}

// Handle legacy dev database URL on Hostinger
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("file:./dev.db")) {
  if (process.env.NODE_ENV === "production") {
    console.warn("⚠️  WARNING: Dev database URL in production. Please set a production DATABASE_URL.");
  }
}

// Validate format
if (process.env.DATABASE_URL && 
    !process.env.DATABASE_URL.startsWith("mysql://") && 
    !process.env.DATABASE_URL.startsWith("file:")) {
  console.warn(`⚠️  WARNING: Invalid DATABASE_URL format: ${process.env.DATABASE_URL.substring(0, 30)}...`);
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


