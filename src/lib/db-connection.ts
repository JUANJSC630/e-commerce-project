import type { PoolConfig } from "pg"

/**
 * Configuración del pool de Postgres, compartida por la app (`src/lib/prisma.ts`) y
 * el seed (`prisma/seed.ts`).
 *
 * El TLS depende del destino: las bases gestionadas (Prisma Postgres, Neon…) exigen
 * verificación completa del certificado, mientras que un Postgres local de
 * desarrollo habla en claro y rechazaría la conexión si le pedimos TLS.
 */

/** Un Postgres en la máquina del desarrollador, sin TLS. */
function isLocal(url: string): boolean {
  return /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url)
}

export function poolConfig(): PoolConfig {
  const url = process.env.DATABASE_URL ?? ""

  if (isLocal(url)) return { connectionString: url }

  return {
    // `require` solo cifra; `verify-full` además valida el certificado y el host,
    // que es lo que impide un man-in-the-middle contra la base de producción.
    connectionString: url.replace(/sslmode=require/, "sslmode=verify-full"),
    ssl: { rejectUnauthorized: true },
  }
}
