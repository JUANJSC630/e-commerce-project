import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getSessionUserId } from "@/lib/session"
import { SavedListError, getSavedList } from "@/lib/saved-lists"
import { privatePageMetadata } from "@/lib/seo"
import { SavedListDetail } from "@/components/account/saved-list-detail"

export function generateMetadata(): Promise<Metadata> {
  return privatePageMetadata("Lista guardada")
}

export default async function AccountListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const userId = await getSessionUserId()
  if (!userId) redirect("/cuenta/login")
  const { id } = await params

  try {
    const list = await getSavedList(userId, id)
    return <SavedListDetail list={list} />
  } catch (err) {
    if (err instanceof SavedListError && err.status === 404) notFound()
    throw err
  }
}
