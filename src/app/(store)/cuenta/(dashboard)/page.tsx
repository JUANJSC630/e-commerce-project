import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSessionUserId } from "@/lib/session"
import { getProfile } from "@/lib/account"
import { privatePageMetadata } from "@/lib/seo"
import { ProfileSection } from "@/components/account/profile-section"

export function generateMetadata(): Promise<Metadata> {
  return privatePageMetadata("Mi perfil")
}

export default async function AccountProfilePage() {
  const userId = await getSessionUserId()
  if (!userId) redirect("/cuenta/login")

  const profile = await getProfile(userId)

  return <ProfileSection profile={profile} />
}
