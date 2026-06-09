import { Package } from "lucide-react"
import type { FeatureItem } from "@/config/store.config"
import { getLucideIcon } from "@/lib/lucide-icons"

interface TrustBarProps {
  features: FeatureItem[]
}

export function TrustBar({ features }: TrustBarProps) {
  // Two copies: translateX(-50%) moves exactly one copy-width → seamless loop.
  // Three copies would move 1.5× copy-width, causing a mid-item jump on reset.
  const items = [...features, ...features]

  return (
    <section aria-label="Nuestras garantías" className="bg-brand-base overflow-hidden py-3">
      <div className="flex animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
        {items.map((item, i) => {
          const Icon = getLucideIcon(item.icon) ?? Package
          return (
            <span
              key={`${item.icon}-${i}`}
              className="inline-flex items-center gap-2.5 px-7 text-sm font-display font-semibold text-brand-on-base"
            >
              <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true" />
              <span>{item.title}</span>
              {item.description && (
                <span className="text-brand-on-base/55 font-normal">— {item.description}</span>
              )}
              <span className="ml-5 text-brand-on-base/30" aria-hidden="true">
                ·
              </span>
            </span>
          )
        })}
      </div>
    </section>
  )
}
