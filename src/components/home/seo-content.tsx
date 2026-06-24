interface SeoContentProps {
  brandName: string
}

export function SeoContent({ brandName }: SeoContentProps) {
  return (
    <section className="py-16 px-4 bg-brand-surface/50 border-t border-border">
      <div className="container mx-auto max-w-3xl prose prose-sm prose-slate">
        <h2 className="text-xl font-bold text-brand-ink">
          Ropa Infantil de Calidad — {brandName}
        </h2>
        <p className="text-brand-muted leading-relaxed">
          En {brandName} creemos que la infancia merece ropa tan especial como cada momento que la
          acompaña. Nuestra tienda de ropa infantil online ofrece prendas diseñadas con materiales
          suaves, seguros y duraderos para bebés de 0 a 24 meses, niñas y niños de todas las edades.
        </p>

        <h3 className="text-lg font-semibold text-brand-ink mt-6">
          Moda para Cada Etapa del Crecimiento
        </h3>
        <p className="text-brand-muted leading-relaxed">
          Desde los primeros bodys y pijamas hasta conjuntos escolares y ropa de fiesta, cada pieza
          de {brandName} combina comodidad con estilo moderno. Nuestros diseños se adaptan al
          movimiento, al juego y a la imaginación — porque la ropa de tus hijos debe crecer con
          ellos.
        </p>

        <h3 className="text-lg font-semibold text-brand-ink mt-6">
          Compra Segura con Envío a Todo el País
        </h3>
        <p className="text-brand-muted leading-relaxed">
          Ofrecemos envío rápido, pagos seguros con múltiples métodos (tarjeta, MercadoPago,
          transferencia) y atención personalizada. Compra ropa para bebés, ropa para niñas y ropa
          para niños desde la comodidad de tu hogar con la garantía de calidad de {brandName}.
        </p>
      </div>
    </section>
  )
}
