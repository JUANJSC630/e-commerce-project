import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSessionUserId } from "@/lib/session"
import { listSavedLists } from "@/lib/saved-lists"
import { privatePageMetadata } from "@/lib/seo"
import { SavedListsSection } from "@/components/account/saved-lists-section"

export function generateMetadata(): Promise<Metadata> {
  return privatePageMetadata("Mis listas")
}

export default async function AccountListsPage() {
  const userId = await getSessionUserId()
  if (!userId) redirect("/cuenta/login")

  const lists = await listSavedLists(userId)

  return <SavedListsSection initialLists={lists} />
}
