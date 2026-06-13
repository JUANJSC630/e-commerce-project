import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

const { Pool } = pg

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL?.replace(
    /sslmode=require/,
    "sslmode=verify-full",
  )
  const adapter = new PrismaPg(
    // Serverless: each instance handles a handful of concurrent requests, so a
    // small pool keeps total connections in check (instances × max) against the
    // Postgres limit, and idle connections are released promptly.
    new Pool({
      connectionString,
      ssl: { rejectUnauthorized: true },
      max: 5,
      idleTimeoutMillis: 10_000,
    }),
  )
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
