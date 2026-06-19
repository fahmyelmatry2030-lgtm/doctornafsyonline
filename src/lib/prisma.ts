import { PrismaClient } from "@prisma/client";

// Auto-detect and handle database URL
if (!process.env.DATABASE_URL) {
  // Default to dev SQLite for local development
  if (process.env.NODE_ENV !== "production") {
    console.log("ℹ️  No DATABASE_URL found. Using SQLite for local development.");
    process.env.DATABASE_URL = "file:./prisma/dev.db";
  } else {
    console.warn("⚠️  WARNING: DATABASE_URL is not set in production environment! Using fallback placeholder.");
    process.env.DATABASE_URL = "mysql://u465666297_u465666297:Doctor1346790@127.0.0.1:3306/u465666297_u465666297";
  }
}

// Handle legacy dev database URL on Hostinger
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("file:./dev.db")) {
  if (process.env.NODE_ENV === "production") {
    console.warn("⚠️  WARNING: Dev database URL in production. Switching to MySQL.");
    process.env.DATABASE_URL = "mysql://u465666297_u465666297:Doctor1346790@127.0.0.1:3306/u465666297_u465666297";
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


