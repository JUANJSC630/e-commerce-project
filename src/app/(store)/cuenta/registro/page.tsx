import type { Metadata } from "next"
import { Suspense } from "react"
import { RegisterForm } from "@/components/account/register-form"
import { brand } from "@/config/store.config"

export const metadata: Metadata = {
  title: `Crear cuenta — ${brand.name}`,
  robots: { index: false, follow: false },
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
