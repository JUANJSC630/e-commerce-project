import type { Metadata } from "next"
import { privatePageMetadata } from "@/lib/seo"
import { ChangePasswordForm } from "@/components/account/change-password-form"

export function generateMetadata(): Promise<Metadata> {
  return privatePageMetadata("Seguridad")
}

export default function AccountSecurityPage() {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <h1 className="font-display text-2xl font-bold text-brand-ink">Seguridad</h1>
      <p className="mt-1 text-sm text-brand-muted">
        Actualiza tu contraseña para mantener tu cuenta protegida.
      </p>

      <div className="mt-6 border-t border-border pt-6">
        <h2 className="mb-4 font-semibold text-brand-ink">Cambiar contraseña</h2>
        <ChangePasswordForm />
      </div>
    </section>
  )
}
