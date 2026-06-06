"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SETTINGS_SECTIONS } from "./sections"

const BASE = "/admin/settings"

/** Vertical section nav for the settings area; highlights the active route. */
export function SettingsNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Secciones de configuración" className="flex flex-col gap-0.5">
      {SETTINGS_SECTIONS.map(({ slug, label, description, icon: Icon }) => {
        const href = `${BASE}/${slug}`
        const active = pathname === href
        return (
          <Link
            key={slug}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-start gap-3 rounded-lg px-3 py-2 transition-colors ${
              active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Icon
              className={`h-4 w-4 mt-0.5 shrink-0 ${active ? "text-indigo-600" : "text-slate-400"}`}
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium leading-tight">{label}</span>
              <span className="block text-[11px] text-slate-400 truncate">{description}</span>
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
