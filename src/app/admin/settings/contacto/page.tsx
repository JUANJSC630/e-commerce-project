import { loadAllSettings } from "@/lib/settings"
import { ContactEditor } from "@/components/admin/settings/contact-editor"

export default async function ContactSettingsPage() {
  const { contact } = await loadAllSettings()
  return <ContactEditor data={contact} />
}
