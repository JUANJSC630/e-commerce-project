import { permanentRedirect } from "next/navigation"

// "Esenciales" is now a regular admin-managed category. Keep the old URL working.
export default function EssentialsRedirect() {
  permanentRedirect("/category/essentials")
}
