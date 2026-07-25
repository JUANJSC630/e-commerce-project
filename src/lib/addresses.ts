import "server-only"

import { prisma } from "@/lib/prisma"

/** Domain error with an HTTP status for the address API routes to map. */
export class AddressError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message)
    this.name = "AddressError"
  }
}

const TEXT_MAX = 120
const PHONE_RE = /^[0-9+()\-\s]{7,20}$/
const ZIP_RE = /^[0-9]{3,10}$/

/** A saved shipping address, as exposed to the account UI. */
export interface Address {
  id: string
  label: string | null
  recipientName: string | null
  phone: string | null
  address: string
  city: string
  state: string
  country: string
  zipCode: string | null
  isDefault: boolean
}

/** Editable fields accepted from the client (all validated before writing). */
export interface AddressInput {
  label?: unknown
  recipientName?: unknown
  phone?: unknown
  address?: unknown
  city?: unknown
  state?: unknown
  country?: unknown
  zipCode?: unknown
  isDefault?: unknown
}

const SELECT = {
  id: true,
  label: true,
  recipientName: true,
  phone: true,
  address: true,
  city: true,
  state: true,
  country: true,
  zipCode: true,
  isDefault: true,
} as const

// Prisma Postgres can cold-start; give small multi-step writes room like orders.ts.
const TX_OPTS = { maxWait: 10_000, timeout: 20_000 }

function requiredText(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) throw new AddressError(`${label} es requerido`)
  const trimmed = value.trim()
  if (trimmed.length > TEXT_MAX) throw new AddressError(`${label} es demasiado largo`)
  return trimmed
}

function optionalText(
  value: unknown,
  label: string,
  { pattern, max = TEXT_MAX }: { pattern?: RegExp; max?: number } = {},
): string | null {
  if (value === undefined || value === null) return null
  if (typeof value !== "string") throw new AddressError(`${label} inválido`)
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.length > max) throw new AddressError(`${label} es demasiado largo`)
  if (pattern && !pattern.test(trimmed))
    throw new AddressError(`${label} no tiene un formato válido`)
  return trimmed
}

/** Validates + normalizes the writable fields; throws AddressError on bad input. */
function parseInput(input: AddressInput) {
  return {
    address: requiredText(input.address, "La dirección"),
    city: requiredText(input.city, "La ciudad"),
    state: requiredText(input.state, "El departamento"),
    country: requiredText(input.country, "El país"),
    label: optionalText(input.label, "La etiqueta"),
    recipientName: optionalText(input.recipientName, "El nombre"),
    phone: optionalText(input.phone, "El teléfono", { pattern: PHONE_RE, max: 20 }),
    zipCode: optionalText(input.zipCode, "El código postal", { pattern: ZIP_RE, max: 10 }),
    isDefault: input.isDefault === true,
  }
}

/** Addresses for a user, default first then oldest. */
export function listAddresses(userId: string): Promise<Address[]> {
  return prisma.address.findMany({
    where: { userId },
    select: SELECT,
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  })
}

export async function createAddress(userId: string, input: AddressInput): Promise<Address> {
  const data = parseInput(input)
  return prisma.$transaction(async (tx) => {
    const count = await tx.address.count({ where: { userId } })
    // The first address is always the default; otherwise honor the request.
    const makeDefault = data.isDefault || count === 0
    if (makeDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      })
    }
    return tx.address.create({
      data: { ...data, isDefault: makeDefault, userId },
      select: SELECT,
    })
  }, TX_OPTS)
}

export async function updateAddress(
  userId: string,
  id: string,
  input: AddressInput,
): Promise<Address> {
  const data = parseInput(input)
  return prisma.$transaction(async (tx) => {
    const existing = await tx.address.findFirst({ where: { id, userId }, select: { id: true } })
    if (!existing) throw new AddressError("Dirección no encontrada", 404)
    if (data.isDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      })
    }
    return tx.address.update({ where: { id }, data, select: SELECT })
  }, TX_OPTS)
}

export async function setDefaultAddress(userId: string, id: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const addr = await tx.address.findFirst({ where: { id, userId }, select: { id: true } })
    if (!addr) throw new AddressError("Dirección no encontrada", 404)
    await tx.address.updateMany({
      where: { userId, isDefault: true, NOT: { id } },
      data: { isDefault: false },
    })
    await tx.address.update({ where: { id }, data: { isDefault: true } })
  }, TX_OPTS)
}

export async function deleteAddress(userId: string, id: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const addr = await tx.address.findFirst({
      where: { id, userId },
      select: { id: true, isDefault: true },
    })
    if (!addr) throw new AddressError("Dirección no encontrada", 404)
    await tx.address.delete({ where: { id } })
    // If we removed the default, promote the next oldest so one stays default.
    if (addr.isDefault) {
      const next = await tx.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      })
      if (next) await tx.address.update({ where: { id: next.id }, data: { isDefault: true } })
    }
  }, TX_OPTS)
}
