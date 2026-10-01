import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not defined. Add it to server/.env before using Prisma."
  );
}

const adapter = new PrismaMariaDb(databaseUrl, {
  connectionLimit: 5,
  connectTimeout: 10000,
  acquireTimeout: 10000,
  useTextProtocol: true,
});

export const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
});