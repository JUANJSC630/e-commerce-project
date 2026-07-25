"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { X, Sparkles } from "lucide-react"
import { LoginFormFields } from "@/components/account/login-form"
import { RegisterFormFields } from "@/components/account/register-form"

type View = "login" | "register"

interface AccountDialogContextValue {
  openLogin: () => void
  openRegister: () => void
  close: () => void
}

const AccountDialogContext = createContext<AccountDialogContextValue | null>(null)

/** Opens/closes the storefront account modal from anywhere in the store subtree. */
export function useAccountDialog(): AccountDialogContextValue {
  const ctx = useContext(AccountDialogContext)
  if (!ctx) throw new Error("useAccountDialog must be used within <AccountDialogProvider>")
  return ctx
}

/**
 * Provides the account modal (login / register) to the storefront. Signing in
 * or registering here keeps the user on the page they were on: on success the
 * modal closes and `router.refresh()` re-runs the server layout so the header,
 * cart and favorites pick up the new session. The full-page `/cuenta/login`
 * and `/cuenta/registro` routes remain as a progressive-enhancement fallback.
 */
export function AccountDialogProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [view, setView] = useState<View | null>(null)

  const close = useCallback(() => setView(null), [])
  const openLogin = useCallback(() => setView("login"), [])
  const openRegister = useCallback(() => setView("register"), [])

  const handleSuccess = useCallback(() => {
    setView(null)
    router.refresh()
  }, [router])

  useEffect(() => {
    if (!view) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close()
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [view, close])

  const value = useMemo(
    () => ({ openLogin, openRegister, close }),
    [openLogin, openRegister, close],
  )

  const isLogin = view === "login"

  return (
    <AccountDialogContext.Provider value={value}>
      {children}

      {view && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-brand-ink/40 p-4"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-dialog-title"
            onClick={(e) => e.stopPropagation()}
            className="relative grid w-full max-w-3xl overflow-hidden rounded-2xl bg-card shadow-xl md:grid-cols-2"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar"
              className="absolute top-4 right-4 z-10 grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-brand-surface-alt"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Decorative brand panel (hidden on mobile) */}
            <aside className="hidden bg-gradient-to-br from-brand-base to-brand-ink p-8 text-brand-surface md:flex md:flex-col md:justify-between">
              <Sparkles className="h-8 w-8" aria-hidden="true" />
              <div>
                <p className="font-display text-2xl font-bold leading-tight">
                  {isLogin ? "Qué bueno verte de nuevo" : "Únete a la familia"}
                </p>
                <p className="mt-2 text-sm text-brand-surface/80">
                  {isLogin
                    ? "Accede a tu cuenta para seguir tus pedidos y guardar tus favoritos."
                    : "Crea tu cuenta para comprar más rápido y no perder de vista tus pedidos."}
                </p>
              </div>
            </aside>

            {/* Form panel */}
            <div className="p-8">
              <header className="mb-6">
                <h2
                  id="account-dialog-title"
                  className="font-display text-2xl font-bold text-brand-ink"
                >
                  {isLogin ? "Inicia sesión" : "Crea tu cuenta"}
                </h2>
                <p className="mt-1 text-sm text-brand-muted">
                  {isLogin
                    ? "Accede a tu cuenta y tus pedidos"
                    : "Guarda tus datos y sigue tus pedidos"}
                </p>
              </header>

              {isLogin ? (
                <LoginFormFields onSuccess={handleSuccess} />
              ) : (
                <RegisterFormFields onSuccess={handleSuccess} />
              )}

              <p className="mt-6 text-center text-sm text-brand-muted">
                {isLogin ? (
                  <>
                    ¿No tienes cuenta?{" "}
                    <button
                      type="button"
                      onClick={openRegister}
                      className="font-medium text-brand-base hover:underline"
                    >
                      Regístrate
                    </button>
                  </>
                ) : (
                  <>
                    ¿Ya tienes cuenta?{" "}
                    <button
                      type="button"
                      onClick={openLogin}
                      className="font-medium text-brand-base hover:underline"
                    >
                      Inicia sesión
                    </button>
                  </>
                )}
              </p>

              {/* Fallback to the full page for deep links / no-JS. */}
              <p className="mt-2 text-center text-xs text-brand-muted/70">
                <Link
                  href={isLogin ? "/cuenta/login" : "/cuenta/registro"}
                  onClick={close}
                  className="hover:underline"
                >
                  Abrir en página completa
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </AccountDialogContext.Provider>
  )
}
