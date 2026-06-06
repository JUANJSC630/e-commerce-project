import "server-only"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { CUSTOMER_ROLE_SLUG } from "@/lib/permissions"

/** Domain error with an HTTP status for the account API routes to map. */
export class AccountError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message)
    this.name = "AccountError"
  }
}

export const PASSWORD_MIN_LENGTH = 8
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

let customerRoleId: string | undefined

/** Finds or creates the customer role (no admin permissions); caches its id. */
export async function ensureCustomerRole(): Promise<string> {
  if (customerRoleId) return customerRoleId
  const role = await prisma.role.upsert({
    where: { slug: CUSTOMER_ROLE_SLUG },
    update: {},
    create: {
      name: "Cliente",
      slug: CUSTOMER_ROLE_SLUG,
      description: "Cliente de la tienda. Sin acceso al panel.",
      isSystem: true,
      permissions: {},
    },
    select: { id: true },
  })
  customerRoleId = role.id
  return role.id
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export async function registerCustomer(input: RegisterInput): Promise<{ id: string }> {
  const name = input.name?.trim()
  const email = input.email?.trim().toLowerCase()
  const password = input.password ?? ""

  if (!name) throw new AccountError("El nombre es requerido")
  if (!email || !EMAIL_RE.test(email)) throw new AccountError("Email inválido")
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new AccountError(`La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`)
  }

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (existing) throw new AccountError("Ya existe una cuenta con este email", 409)

  const roleId = await ensureCustomerRole()
  const user = await prisma.user.create({
    data: { name, email, password: await bcrypt.hash(password, 12), roleId, status: "ACTIVE" },
    select: { id: true },
  })
  return user
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (newPassword.length < PASSWORD_MIN_LENGTH) {
    throw new AccountError(
      `La nueva contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`,
    )
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } })
  if (!user) throw new AccountError("Usuario no encontrado", 404)

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) throw new AccountError("La contraseña actual es incorrecta")

  await prisma.user.update({
    where: { id: userId },
    data: { password: await bcrypt.hash(newPassword, 12) },
  })
}
