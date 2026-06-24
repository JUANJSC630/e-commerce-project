import Link from "next/link"

interface CategoryPill {
  label: string
  href: string
}

interface CategoryPillsProps {
  pills: CategoryPill[]
}

export function CategoryPills({ pills }: CategoryPillsProps) {
  if (pills.length === 0) return null

  return (
    <nav
      aria-label="Acceso rápido a categorías"
      className="flex flex-wrap justify-center gap-2 px-4 py-4 bg-brand-surface"
    >
      {pills.map((pill) => (
        <Link
          key={pill.href}
          href={pill.href}
          className="px-4 py-2 rounded-full text-sm font-medium bg-card border border-border text-brand-ink hover:bg-brand-base hover:text-brand-on-base hover:border-brand-base transition-colors"
        >
          {pill.label}
        </Link>
      ))}
    </nav>
  )
}
