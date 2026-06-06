import Link from "next/link"

interface AuthShellProps {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: { prompt: string; linkLabel: string; href: string }
}

/** Centered card layout shared by the customer login and registration forms. */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
        <header className="mb-6 text-center">
          <h1 className="font-display font-bold text-2xl text-brand-ink">{title}</h1>
          <p className="text-sm text-brand-muted mt-1">{subtitle}</p>
        </header>

        {children}

        <p className="text-sm text-brand-muted text-center mt-6">
          {footer.prompt}{" "}
          <Link href={footer.href} className="text-brand-base font-medium hover:underline">
            {footer.linkLabel}
          </Link>
        </p>
      </div>
    </div>
  )
}
