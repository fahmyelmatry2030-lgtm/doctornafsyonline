import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  let databaseUrl = process.env.DATABASE_URL;

  // Align runtime SQLite path with Prisma CLI path (always use prisma/dev.db)
  if (databaseUrl && databaseUrl.startsWith("file:")) {
    const absolutePath = path.resolve(process.cwd(), "prisma", "dev.db");
    databaseUrl = `file:${absolutePath}`;
    console.log(`Prisma resolved SQLite database path: ${absolutePath}`);
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    ...(databaseUrl ? {
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    } : {}),
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


