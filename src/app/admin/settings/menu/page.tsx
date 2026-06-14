import { loadAllSettings } from "@/lib/settings"
import { MenuEditor } from "@/components/admin/settings/menu-editor"

export default async function MenuSettingsPage() {
  const { headerLinks } = await loadAllSettings()
  return <MenuEditor data={headerLinks} />
}
