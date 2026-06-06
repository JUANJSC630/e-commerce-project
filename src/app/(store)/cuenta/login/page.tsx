import type { Metadata } from "next"
import { Suspense } from "react"
import { LoginForm } from "@/components/account/login-form"
import { brand } from "@/config/store.config"

export const metadata: Metadata = {
  title: `Iniciar sesión — ${brand.name}`,
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
