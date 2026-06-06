import type { Metadata } from "next"
import { Suspense } from "react"
import { RegisterForm } from "@/components/account/register-form"
import { privatePageMetadata } from "@/lib/seo"

export function generateMetadata(): Promise<Metadata> {
  return privatePageMetadata("Crear cuenta")
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
