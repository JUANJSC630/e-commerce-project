"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthShell } from "@/components/account/auth-shell"

interface LoginFormFieldsProps {
  /** Where to send the user after a successful login (page flow). Ignored when `onSuccess` is set. */
  callbackUrl?: string
  /** Modal flow: called instead of navigating, so the user stays on the current page. */
  onSuccess?: () => void
}

/**
 * The login `<form>` and its `signIn` logic, without page chrome. Shared by the
 * full-page login (`LoginForm` + `AuthShell`) and the account modal, so both
 * flows use the exact same validation and submit path.
 */
export function LoginFormFields({ callbackUrl = "/cuenta", onSuccess }: LoginFormFieldsProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signIn("credentials", { email, password, redirect: false })

    if (result?.error) {
      // Thrown errors (e.g. rate limit) carry a message; a plain bad credential
      // surfaces as the generic "CredentialsSignin" code.
      setError(
        result.error === "CredentialsSignin" ? "Email o contraseña incorrectos" : result.error,
      )
      setLoading(false)
      return
    }
    window.dispatchEvent(new Event("auth-changed")) // sync favorites to the account
    if (onSuccess) {
      onSuccess()
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Ingresando…" : "Iniciar sesión"}
      </Button>
    </form>
  )
}

/** Full-page login: the shared form wrapped in the centered auth card. */
export function LoginForm() {
  const callbackUrl = useSearchParams().get("callbackUrl") ?? "/cuenta"

  return (
    <AuthShell
      title="Inicia sesión"
      subtitle="Accede a tu cuenta y tus pedidos"
      footer={{ prompt: "¿No tienes cuenta?", linkLabel: "Regístrate", href: "/cuenta/registro" }}
    >
      <LoginFormFields callbackUrl={callbackUrl} />
    </AuthShell>
  )
}
