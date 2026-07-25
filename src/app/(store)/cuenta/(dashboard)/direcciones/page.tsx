import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSessionUserId } from "@/lib/session"
import { listAddresses } from "@/lib/addresses"
import { privatePageMetadata } from "@/lib/seo"
import { AddressesSection } from "@/components/account/addresses-section"

export function generateMetadata(): Promise<Metadata> {
  return privatePageMetadata("Mis direcciones")
}

export default async function AccountAddressesPage() {
  const userId = await getSessionUserId()
  if (!userId) redirect("/cuenta/login")

  const addresses = await listAddresses(userId)

  return <AddressesSection initialAddresses={addresses} />
}
