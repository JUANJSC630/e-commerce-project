import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { Package, ChevronRight } from "lucide-react"
import { authOptions } from "@/lib/auth-options"
import { brand, routes } from "@/config/store.config"
import { LogoutButton } from "@/components/account/logout-button"
import { ChangePasswordForm } from "@/components/account/change-password-form"

export const metadata: Metadata = {
  title: `Mi cuenta — ${brand.name}`,
  robots: { index: false, follow: false },
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/cuenta/login")

  const { name, email } = session.user

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl space-y-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-brand-ink">
            Hola{name ? `, ${name}` : ""}
          </h1>
          <p className="text-brand-muted mt-1">{email}</p>
        </div>
        <LogoutButton />
      </header>

      <Link
        href={`${routes.account}/pedidos`}
        className="flex items-center justify-between gap-4 bg-card border border-border rounded-xl p-5 hover:border-brand-base transition-colors"
      >
        <span className="flex items-center gap-3">
          <Package className="h-5 w-5 text-brand-base" aria-hidden="true" />
          <span>
            <span className="block font-semibold text-brand-ink">Mis pedidos</span>
            <span className="block text-sm text-brand-muted">
              Revisa el estado y el historial de tus compras
            </span>
          </span>
        </span>
        <ChevronRight className="h-5 w-5 text-brand-muted" aria-hidden="true" />
      </Link>

      <section className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold text-brand-ink mb-4">Cambiar contraseña</h2>
        <ChangePasswordForm />
      </section>
    </div>
  )
}
