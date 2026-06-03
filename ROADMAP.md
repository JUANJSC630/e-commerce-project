# Roadmap — Dulce Infancia Shop

> Actualizado: 2026-06-03 | Score técnico: **20/20** ✅ (ver AUDIT.md)

---

## Estado General

El e-commerce está en **Fase 1 completada**. Flujo completo home → categoría → detalle → carrito → checkout funciona. Identidad visual aplicada (Nunito, verde salvia, beige). Arquitectura SOLID, sin deuda técnica. Lo que resta para lanzar al público: imágenes reales, buscador, filtros, SEO y deploy.

---

## Módulos Existentes

| Módulo              | Ruta                | Estado          | Notas                                                               |
| ------------------- | ------------------- | --------------- | ------------------------------------------------------------------- |
| Home                | `/`                 | ✅ Sólido       | Hero split 45/55, trust bar marquee, brand promise, productos       |
| Categoría Bebés     | `/category/babies`  | ✅ Funcional    | 5 productos, conectado a allMockProducts                            |
| Categoría Niñas     | `/category/girls`   | ✅ Funcional    | 4 productos, conectado a allMockProducts                            |
| Categoría Niños     | `/category/boys`    | ✅ Funcional    | 4 productos, conectado a allMockProducts                            |
| Ofertas             | `/category/sales`   | ✅ Funcional    | Filtra `isOnSale: true`                                             |
| Esenciales          | `/essentials`       | ✅ Funcional    | 3 productos, categoría "Essentials"                                 |
| Todos los productos | `/products`         | ✅ Funcional    | 17 productos del catálogo unificado                                 |
| Detalle de producto | `/products/[id]`    | ✅ Funcional    | Galería, tallas, colores, relacionados, breadcrumb                  |
| Carrito             | `/carrito`          | ✅ Funcional    | Edición de cantidad, AlertDialog para vaciar                        |
| Checkout            | `/checkout-flow`    | ✅ Funcional    | 4 pasos, Luhn, isSubmitting guard, validación unificada             |
| 404                 | `/[ruta-invalida]`  | ✅ Funcional    | `not-found.tsx` con branding y CTAs                                 |
| Error runtime       | —                   | ✅ Funcional    | `error.tsx` con botón reset y branding                              |
| Cart Context        | —                   | ✅ Sólido       | Provider + localStorage, extensible                                 |
| Favorites hook      | —                   | ✅ Funcional    | `useFavorites(id)` con localStorage — persiste entre navegaciones   |
| Sistema de tema     | `globals.css`       | ✅ Sólido       | OKLCH tokens, Nunito + Atkinson Hyperlegible, beige + verde salvia  |
| Store config        | `store.config.ts`   | ✅ Centralizado | Brand, nav, rutas, categorías, pagos, social, contacto, homeContent |
| Validación          | `lib/validation.ts` | ✅ Centralizado | Luhn, getCardType, validateShipping, validatePayment                |
| Mock data           | `lib/mock-data.ts`  | ✅ Unificado    | 17 productos, IDs consistentes, getFeaturedProducts()               |

---

## Módulos Faltantes

### 🟠 P1 — Necesarios para lanzar al público

| Módulo                    | Ruta                 | Descripción                                                                         |
| ------------------------- | -------------------- | ----------------------------------------------------------------------------------- |
| **Buscador**              | `/search?q=`         | Input en header + página de resultados filtrando por nombre/categoría en mock-data. |
| **Breadcrumbs**           | Componente global    | Orientación en categorías y detalle. `breadcrumb.tsx` ya existe en shadcn/ui.       |
| **Filtros en categorías** | `category-page.tsx`  | Por precio, talla, color. Sidebar en desktop, drawer en móvil.                      |
| **SEO por página**        | `generateMetadata()` | Cada categoría, detalle y home necesita título, descripción y OG tags propios.      |
| **sitemap.ts**            | `app/sitemap.ts`     | Generación automática con Next.js. ~10 líneas de código.                            |
| **robots.txt**            | `public/robots.txt`  | Archivo básico para indexación. Sin él Google puede crawlear rutas internas.        |

### 🟡 P2 — Segunda iteración

| Módulo                   | Ruta                  | Descripción                                                                                                |
| ------------------------ | --------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Página /favoritos**    | `/favoritos`          | El hook `useFavorites` ya existe con localStorage. Solo falta la página que liste los productos favoritos. |
| **Banner de promoción**  | `layout.tsx` (header) | Franja colapsable: "Envío gratis en compras +$150.000". Urgency driver.                                    |
| **Imágenes reales**      | `public/`             | La mayoría usa `/placeholder.svg`. Sin imágenes reales no se puede lanzar al público.                      |
| **Deploy en Vercel**     | —                     | Incluso con mock-data, un deploy real permite probar en dispositivos y compartir con clientes.             |
| **Página de cuenta**     | `/cuenta`             | Login/registro básico, mock con localStorage hasta que haya backend real.                                  |
| **Historial de pedidos** | `/cuenta/pedidos`     | Lista de órdenes simuladas.                                                                                |

### 🟢 P3 — Polish post-lanzamiento

| Módulo                       | Ruta                  | Descripción                                                                                         |
| ---------------------------- | --------------------- | --------------------------------------------------------------------------------------------------- |
| **Página de éxito de orden** | `/order-success/[id]` | `OrderConfirmation` vive dentro del checkout. Debería ser página independiente con URL compartible. |
| **Sanity CMS**               | —                     | Reemplazar mock-data con catálogo real gestionado visualmente. Sin código para agregar productos.   |
| **MercadoPago**              | —                     | Checkout Bricks (recomendado). Prioridad para mercado colombiano/latinoamericano.                   |
| **Google Analytics 4**       | —                     | Embudo de conversión. Variable lista en `.env.local.example`.                                       |
| **Meta Pixel**               | —                     | Retargeting. Variable lista en `.env.local.example`.                                                |

---

## Historial de Bloques Completados

### ✅ Bloque 0 — Fundación

```
[x] Next.js 15.3.3, Tailwind v4, shadcn/ui, TypeScript strict
[x] Sistema de tokens OKLCH
[x] Cart Context + localStorage
[x] Multi-step checkout con validación Luhn
[x] Categorías con mock-data
```

### ✅ Bloque 1 — Funcionalidad base

```
[x] Página detalle de producto /products/[id]
[x] Footer completo conectado a store.config.ts
[x] Nav móvil hamburger + Sheet drawer
[x] not-found.tsx + error.tsx con branding
```

### ✅ Bloque 2 — Bug fixes críticos + Tooling

```
[x] Unificar sistema de toast → Sonner (react-hot-toast eliminado)
[x] window.confirm → AlertDialog
[x] Fix priority={true} en ProductCards
[x] Fix touch targets en banner dots
[x] ARIA radio buttons PaymentForm
[x] Prettier + ESLint + pipeline yarn validate
```

### ✅ Bloque 3 — Deuda técnica

```
[x] Unificar catálogos → 17 productos en allMockProducts
[x] Conectar footer a store.config.ts (social.*, contact.*)
[x] Extraer src/lib/validation.ts (Luhn + shipping + payment)
[x] useFavorites hook con localStorage
[x] isSubmitting en checkout (prevenir doble cobro)
[x] .env.local.example con secciones por servicio
[x] README.md reescrito con stack real
```

### ✅ Bloque 4 — Identidad visual

```
[x] Tipografía: Nunito (display) + Atkinson Hyperlegible (cuerpo)
[x] Acento: Verde Salvia oklch(0.68 0.08 145)
[x] Superficie: Beige claro oklch(0.95 0.022 80)
[x] Modo claro only — bloque .dark eliminado
[x] Hero: split 45/55 sin autoplay, pill indicators
[x] Trust bar: marquee CSS 2 copias, keyframe en globals.css
[x] Brand promise: <p> editorial a clamp(1.75–3.25rem)
[x] Headings: left-aligned, eyebrow labels en todas las secciones
```

### ✅ Bloque 5 — Arquitectura SOLID homepage

```
[x] page.tsx → Server Component puro (36 líneas, sin estado)
[x] 5 componentes enfocados en src/components/home/
[x] Todo el copy en homePageContent en store.config.ts
[x] getFeaturedProducts(limit) en mock-data.ts
[x] formatPrice() en utils.ts con locale del config
[x] ProductCard usa Product de types.ts (no inline type)
[x] Accessibility fixes: aria-live, aria-labelledby, aria-hidden correcto
[x] Eliminado tabs.README.md (archivo basura de scaffolding)
```

### ⏳ Bloque 6 — Features P1 (siguiente)

```
[ ] robots.txt
[ ] sitemap.ts
[ ] generateMetadata() por página
[ ] Breadcrumbs
[ ] Página /favoritos
[ ] Buscador /search
[ ] Filtros en categorías
```

### ⏳ Bloque 7 — Lanzamiento

```
[ ] Imágenes reales de productos
[ ] Deploy en Vercel con dominio real
[ ] Integración MercadoPago
[ ] Google Analytics 4 + Meta Pixel
```

---

## Arquitectura de Referencia (estado actual)

```
src/
├── app/
│   ├── layout.tsx                    ← Header + Footer + CartProvider (Server)
│   ├── page.tsx                      ← Orquestador Home — Server Component, 36 líneas
│   ├── not-found.tsx                 ← 404 con branding ✅
│   ├── error.tsx                     ← Error runtime con branding ✅
│   ├── carrito/page.tsx              ← Carrito con AlertDialog
│   ├── checkout-flow/page.tsx        ← 4 pasos, isSubmitting guard
│   ├── essentials/page.tsx
│   ├── products/
│   │   ├── page.tsx                  ← Todos los productos (17)
│   │   └── [id]/page.tsx             ← Detalle ✅
│   ├── search/page.tsx               ← (PENDIENTE)
│   ├── favoritos/page.tsx            ← (PENDIENTE — hook ya listo)
│   └── category/
│       ├── babies/page.tsx
│       ├── girls/page.tsx
│       ├── boys/page.tsx
│       └── sales/page.tsx
├── components/
│   ├── home/                         ← 5 componentes SOLID de la homepage
│   │   ├── hero-section.tsx          ← "use client" (estado de carousel)
│   │   ├── trust-bar.tsx             ← Server Component
│   │   ├── categories-section.tsx    ← Server Component
│   │   ├── brand-promise.tsx         ← Server Component
│   │   └── featured-products.tsx     ← Server Component
│   ├── cart/                         ← Sistema completo (7 archivos)
│   ├── category/                     ← CategoryPage + SalesPage
│   ├── checkout/                     ← 5 pasos del checkout
│   ├── layout/
│   │   ├── mobile-nav.tsx            ← Hamburger + Sheet ✅
│   │   └── footer.tsx                ← Conectado a store.config ✅
│   ├── product/
│   │   └── product-card.tsx          ← Product type, formatPrice, useFavorites ✅
│   └── ui/                           ← shadcn/ui (50+ componentes)
├── config/
│   ├── store.config.ts               ← brand, nav, rutas, social, contact, homePageContent
│   └── theme.config.ts               ← Paleta OKLCH + tipografía
├── hooks/
│   ├── use-cart.ts                   ← Wrapper del CartContext
│   ├── use-favorites.ts              ← localStorage por ID ✅
│   ├── use-mobile.tsx                ← Breakpoint 768px
│   └── use-sonner.ts                 ← Toast unificado
└── lib/
    ├── mock-data.ts                  ← 17 productos, allMockProducts, getFeaturedProducts
    ├── types.ts                      ← Product, CartItem, CartContextType
    ├── validation.ts                 ← Luhn + validateShipping + validatePayment ✅
    └── utils.ts                      ← cn(), formatPrice() locale-aware
```

---

_Para análisis técnico ver `AUDIT.md`. Para visión de negocio ver `PROJECT.md`._
