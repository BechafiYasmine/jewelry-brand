
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined.");
}

const dbUrl = new URL(databaseUrl);

const ca = process.env.DB_CA_CERT?.replace(/\\n/g, "\n");

if (!ca) {
  throw new Error("DB_CA_CERT is not defined.");
}

const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: Number(dbUrl.port || 3306),
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.slice(1),
  ssl: {
    ca,
    rejectUnauthorized: true,
  },
  connectionLimit: 5,
  connectTimeout: 15000,
  acquireTimeout: 15000,
});

export const prisma = new PrismaClient({
  adapter,
  log: ["error"],
});
