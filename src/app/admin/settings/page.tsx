import { redirect } from "next/navigation"
import { SETTINGS_SECTIONS } from "@/components/admin/settings/sections"

/** Settings has no index of its own - send to the first section. */
export default function AdminSettingsPage() {
  redirect(`/admin/settings/${SETTINGS_SECTIONS[0].slug}`)
}
