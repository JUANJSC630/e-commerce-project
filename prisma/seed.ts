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

import { productsSeed } from "./products-data"
import { categoriesSeed } from "./categories-data"
import { poolConfig } from "../src/lib/db-connection"

const { Pool } = pg

const adapter = new PrismaPg(new Pool(poolConfig()))
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
      categories: ALL,
      discounts: ALL,
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
      categories: ALL,
      discounts: ALL,
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
      categories: ["read", "create", "update"],
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
      categories: READ_ONLY,
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

  // Las credenciales por defecto son solo para desarrollo. Al sembrar una base de
  // producción hay que pasar SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD: si no, la tienda
  // nacería con un super-admin de contraseña pública y conocida.
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@dulceinfancia.com"
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!"
  const usingDefaults = !process.env.SEED_ADMIN_PASSWORD

  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: "Administrador",
      roleId: superAdminRole.id,
      status: "ACTIVE",
    },
  })

  console.log(
    `  ✓ ${adminEmail}${usingDefaults ? "  (password: Admin123! - SOLO DESARROLLO)" : ""}`,
  )
  if (usingDefaults) {
    console.warn("  ⚠️  Contraseña por defecto. En producción define SEED_ADMIN_PASSWORD.")
  }

  console.log("Seeding products…")

  for (const { id, ...data } of productsSeed) {
    await prisma.product.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    })
  }
  console.log(`  ✓ ${productsSeed.length} products`)

  console.log("Seeding categories…")

  for (const { legacyKey, ...data } of categoriesSeed) {
    const category = await prisma.category.upsert({
      where: { slug: data.slug },
      update: {
        name: data.name,
        description: data.description,
        order: data.order,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
      },
      create: data,
    })
    // Backfill: link existing products with the legacy category string.
    const { count } = await prisma.product.updateMany({
      where: { category: legacyKey },
      data: { categoryId: category.id },
    })
    console.log(`  ✓ ${category.name} (${count} productos vinculados)`)
  }

  console.log("\nSeed complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
