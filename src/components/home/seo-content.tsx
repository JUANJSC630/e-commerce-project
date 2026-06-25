import { Heart, Shirt, Truck } from "lucide-react"

interface SeoContentProps {
  brandName: string
}

/**
 * Keyword-rich SEO block for the home (real H2/H3 + copy). Laid out as a centered
 * intro plus icon cards so it reads as a designed section, not a wall of text.
 */
export function SeoContent({ brandName }: SeoContentProps) {
  return (
    <section className="relative overflow-hidden border-t border-border bg-gradient-to-b from-brand-surface/60 to-background py-16 md:py-24 px-4">
      {/* Soft decorative accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-base/5 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-brand-base/5 blur-3xl"
      />

      <div className="container relative mx-auto">
        {/* Intro */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-[0.2em] text-brand-base">
            <Heart className="h-3.5 w-3.5 fill-brand-base" aria-hidden="true" />
            Diseñado con cariño
          </p>
          <h2 className="font-display font-black text-3xl md:text-4xl text-brand-ink leading-tight">
            Ropa Infantil de Calidad
          </h2>
          <p className="mt-4 text-brand-muted leading-relaxed">
            En {brandName} creemos que la infancia merece ropa tan especial como cada momento que la
            acompaña. Nuestra tienda de ropa infantil online ofrece prendas diseñadas con materiales
            suaves, seguros y duraderos para bebés de 0 a 24 meses, niñas y niños de todas las
            edades.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
          <article className="group rounded-2xl border border-border bg-card p-6 md:p-7 shadow-sm transition-shadow hover:shadow-md">
            <span className="mb-4 inline-grid h-12 w-12 place-items-center rounded-xl bg-brand-base/10 text-brand-base transition-colors group-hover:bg-brand-base group-hover:text-brand-on-base">
              <Shirt className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="font-display font-bold text-lg text-brand-ink">
              Moda para Cada Etapa del Crecimiento
            </h3>
            <p className="mt-2 text-sm text-brand-muted leading-relaxed">
              Desde los primeros bodys y pijamas hasta conjuntos escolares y ropa de fiesta, cada
              pieza de {brandName} combina comodidad con estilo moderno. Nuestros diseños se adaptan
              al movimiento, al juego y a la imaginación — porque la ropa de tus hijos debe crecer
              con ellos.
            </p>
          </article>

          <article className="group rounded-2xl border border-border bg-card p-6 md:p-7 shadow-sm transition-shadow hover:shadow-md">
            <span className="mb-4 inline-grid h-12 w-12 place-items-center rounded-xl bg-brand-base/10 text-brand-base transition-colors group-hover:bg-brand-base group-hover:text-brand-on-base">
              <Truck className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="font-display font-bold text-lg text-brand-ink">
              Compra Segura con Envío a Todo el País
            </h3>
            <p className="mt-2 text-sm text-brand-muted leading-relaxed">
              Ofrecemos envío rápido, pagos seguros con múltiples métodos (tarjeta, MercadoPago,
              transferencia) y atención personalizada. Compra ropa para bebés, ropa para niñas y
              ropa para niños desde la comodidad de tu hogar con la garantía de calidad de{" "}
              {brandName}.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
