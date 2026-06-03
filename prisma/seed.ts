/**
 * prisma/seed.ts
 * Seeds the database with default roles and an initial super-admin user.
 *
 * Run: npx tsx prisma/seed.ts
 */

import { config } from "dotenv"
config()

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import bcrypt from "bcryptjs"

const { Pool } = pg

const adapter = new PrismaPg(
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  }),
)
const prisma = new PrismaClient({ adapter })

// ─── Permission definitions ────────────────────────────────────────────────────

const ALL: string[] = ["read", "create", "update", "delete"]
const READ_UPDATE: string[] = ["read", "update"]
const READ_ONLY: string[] = ["read"]
const NONE: string[] = []

const roles = [
  {
    name: "Super Admin",
    slug: "super_admin",
    description: "Acceso total al sistema. No se puede eliminar.",
    isSystem: true,
    permissions: {
      dashboard: READ_ONLY,
      products: ALL,
      orders: ALL,
      users: ALL,
      roles: ALL,
      settings: ["read", "update"],
    },
  },
  {
    name: "Admin",
    slug: "admin",
    description: "Gestión completa de productos, pedidos y usuarios.",
    isSystem: true,
    permissions: {
      dashboard: READ_ONLY,
      products: ALL,
      orders: ALL,
      users: ["read", "create", "update"],
      roles: NONE,
      settings: READ_ONLY,
    },
  },
  {
    name: "Manager",
    slug: "manager",
    description: "Gestión de productos e inventario. Visualización de pedidos.",
    isSystem: false,
    permissions: {
      dashboard: READ_ONLY,
      products: ["read", "create", "update"],
      orders: READ_UPDATE,
      users: NONE,
      roles: NONE,
      settings: NONE,
    },
  },
  {
    name: "Soporte",
    slug: "support",
    description: "Solo visualización y actualización de estado de pedidos.",
    isSystem: false,
    permissions: {
      dashboard: READ_ONLY,
      products: READ_ONLY,
      orders: READ_UPDATE,
      users: NONE,
      roles: NONE,
      settings: NONE,
    },
  },
]

async function main() {
  console.log("Seeding roles…")

  for (const role of roles) {
    await prisma.role.upsert({
      where: { slug: role.slug },
      update: { name: role.name, description: role.description, permissions: role.permissions },
      create: role,
    })
    console.log(`  ✓ ${role.name}`)
  }

  console.log("Seeding super-admin user…")

  const superAdminRole = await prisma.role.findUnique({ where: { slug: "super_admin" } })
  if (!superAdminRole) throw new Error("super_admin role not found")

  const hashedPassword = await bcrypt.hash("Admin123!", 12)

  await prisma.user.upsert({
    where: { email: "admin@dulceinfancia.com" },
    update: {},
    create: {
      email: "admin@dulceinfancia.com",
      password: hashedPassword,
      name: "Administrador",
      roleId: superAdminRole.id,
      status: "ACTIVE",
    },
  })

  console.log("  ✓ admin@dulceinfancia.com  (password: Admin123!)")
  console.log("\nSeed complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
