import type { Metadata } from "next"
import { Suspense } from "react"
import { LoginForm } from "@/components/account/login-form"
import { privatePageMetadata } from "@/lib/seo"

export function generateMetadata(): Promise<Metadata> {
  return privatePageMetadata("Iniciar sesión")
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
