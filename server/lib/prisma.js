import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis;

if (!globalForPrisma.__prisma) {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not defined. Add it to server/.env before using Prisma.");
  }

  const adapter = new PrismaMariaDb(databaseUrl, {
    useTextProtocol: true,
  });

  globalForPrisma.__prisma = new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.__prisma;
