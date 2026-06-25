/**
 * seed-blog.ts — siembra (idempotente, por slug) los artículos iniciales del blog.
 *
 * Uso:  yarn tsx scripts/seed-blog.ts
 * Requiere el `.env` cargado (Prisma CLI/scripts solo leen `.env`).
 */
import "dotenv/config"
import { prisma } from "../src/lib/prisma"

interface SeedPost {
  slug: string
  title: string
  excerpt: string
  content: string
}

const posts: SeedPost[] = [
  {
    slug: "como-elegir-talla-ropa-bebe",
    title: "Cómo elegir la talla correcta de ropa para tu bebé",
    excerpt:
      "Guía práctica para acertar con la talla según la edad, el peso y la etapa de crecimiento de tu pequeño.",
    content: `
<p>Elegir la talla correcta de ropa para un bebé puede ser un reto: crecen rápido y cada marca tiene su propia tabla. Aquí te damos una guía clara para acertar sin desperdiciar prendas.</p>
<h2>Guíate por el peso y la altura, no solo por la edad</h2>
<p>Las tallas por edad (0-3 meses, 3-6 meses…) son una referencia, pero el <strong>peso y la altura</strong> son más confiables. Dos bebés de la misma edad pueden usar tallas distintas.</p>
<h3>Tabla de referencia general</h3>
<ul>
<li><strong>0-3 meses:</strong> hasta 6 kg / 60 cm</li>
<li><strong>3-6 meses:</strong> 6-8 kg / 60-68 cm</li>
<li><strong>6-12 meses:</strong> 8-10 kg / 68-76 cm</li>
</ul>
<h2>Compra pensando en el crecimiento</h2>
<p>Si dudas entre dos tallas, elige la mayor. Un bebé crece muy rápido y una prenda algo holgada dura más semanas que una justa.</p>
<h2>Prioriza la comodidad</h2>
<p>Busca telas suaves, costuras planas y aberturas amplias para el cambio de pañal. La ropa cómoda hace bebés felices y padres tranquilos.</p>
`,
  },
  {
    slug: "tendencias-moda-infantil-2026",
    title: "Tendencias de moda infantil 2026: colores, telas y estilos",
    excerpt:
      "Lo que marcará la temporada en ropa para niños y niñas: tonos tierra, materiales sostenibles y prendas versátiles.",
    content: `
<p>La moda infantil de 2026 combina <strong>comodidad, sostenibilidad y estilo</strong>. Estas son las tendencias que verás en las mejores tiendas.</p>
<h2>Paleta de colores</h2>
<p>Dominan los <strong>tonos tierra</strong> (terracota, verde salvia, beige) junto a acentos suaves de rosa y azul cielo. Combinan entre sí y facilitan armar conjuntos.</p>
<h2>Materiales sostenibles</h2>
<ul>
<li>Algodón orgánico certificado</li>
<li>Tejidos reciclados</li>
<li>Tintes naturales sin químicos agresivos</li>
</ul>
<h2>Prendas versátiles</h2>
<p>Los conjuntos coordinados y las prendas que crecen con el niño (puños ajustables, tiros regulables) ganan protagonismo: menos compras, más uso.</p>
<h3>El básico de la temporada</h3>
<p>El <strong>body de manga larga</strong> en tonos neutros sigue siendo el comodín perfecto para combinar con todo.</p>
`,
  },
  {
    slug: "cuidado-ropa-infantil-consejos",
    title: "5 consejos para que la ropa de tus hijos dure más",
    excerpt:
      "Lavado, secado y almacenamiento: trucos sencillos para conservar las prendas infantiles como nuevas.",
    content: `
<p>La ropa infantil sufre manchas, lavados frecuentes y mucho movimiento. Con estos cuidados, durará más y se verá mejor por más tiempo.</p>
<h2>1. Lava con agua fría</h2>
<p>El agua fría protege los colores y reduce el encogimiento. Además, gastas menos energía.</p>
<h2>2. Trata las manchas al instante</h2>
<p>Cuanto antes actúes, mejor. Un poco de agua y jabón neutro sobre la mancha fresca evita que se fije.</p>
<h2>3. Voltea las prendas estampadas</h2>
<p>Lavar del revés protege estampados y aplicaciones del roce con otras prendas.</p>
<h2>4. Seca a la sombra</h2>
<p>El sol directo decolora. Secar a la sombra mantiene los colores vivos.</p>
<h2>5. Guarda por talla</h2>
<p>Organiza por talla y temporada. Así reutilizas prendas entre hermanos y nada se pierde en el fondo del cajón.</p>
`,
  },
]

async function main() {
  console.log("Sembrando artículos del blog…")
  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: { title: post.title, excerpt: post.excerpt, content: post.content.trim() },
      create: { ...post, content: post.content.trim() },
    })
    console.log(`  ✓ ${post.slug}`)
  }
  console.log(`Listo: ${posts.length} artículos.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
