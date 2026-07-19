"use client"

import { Suspense } from "react"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError("Email o contraseña incorrectos")
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900">Iniciar sesión</h2>
          <p className="text-xs text-slate-500">Acceso restringido al equipo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              placeholder="admin@dulceinfancia.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium transition-colors",
            "hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed",
          )}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-50">
      {/* Subtle brand glow, consistent with the indigo accent used across the admin */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[36rem] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-72 w-72 rounded-full bg-indigo-100/60 blur-3xl" />
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dulce Infancia
            <span className="ml-2 align-middle text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
              Admin
            </span>
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm">Panel de administración</p>
        </div>
        <Suspense
          fallback={
            <div className="bg-white rounded-2xl border border-slate-200 p-8 h-80 animate-pulse" />
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
