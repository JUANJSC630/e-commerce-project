/**
 * Framework-neutral profile constants and types shared by server domain logic
 * (`account.ts`, which is `server-only`) and client components (the profile
 * form). Keep this module free of any server-only import so the client bundle
 * can pull in the enum values and labels safely.
 */

export const GENDERS = ["MALE", "FEMALE", "OTHER", "UNDISCLOSED"] as const
export type Gender = (typeof GENDERS)[number]

/** Human labels (es-CO) for the gender enum, for selects and read-only display. */
export const GENDER_LABELS: Record<Gender, string> = {
  MALE: "Masculino",
  FEMALE: "Femenino",
  OTHER: "Otro",
  UNDISCLOSED: "Prefiero no decirlo",
}

export interface Profile {
  name: string | null
  lastName: string | null
  email: string
  phone: string | null
  docId: string | null
  gender: Gender | null
  /** ISO `yyyy-mm-dd` (date-only), ready for an `<input type="date">`. */
  birthDate: string | null
}

/** Editable subset of the profile. Email is identity and never editable here. */
export interface ProfileInput {
  name?: unknown
  lastName?: unknown
  phone?: unknown
  docId?: unknown
  gender?: unknown
  birthDate?: unknown
}
