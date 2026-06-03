# Roadmap — Dulce Infancia Shop

> Actualizado: 2026-06-03 | Score técnico: **18/20** (ver AUDIT.md)

---

## Estado General

El e-commerce está construido sobre Next.js 15.3.3 (App Router + Turbopack), Tailwind CSS v4 con sistema de tokens OKLCH, shadcn/ui y mock-data unificado. El flujo completo home → categoría → detalle → carrito → checkout funciona. La deuda técnica del Bloque 1 fue completamente saldada. Los únicos issues pendientes son de identidad visual y requieren decisiones de marca antes de ejecutarse.

---

## Módulos Existentes

| Módulo              | Ruta                | Estado          | Notas                                                             |
| ------------------- | ------------------- | --------------- | ----------------------------------------------------------------- |
| Home                | `/`                 | ✅ Funcional    | Hero carousel, grid productos, features section                   |
| Categoría Bebés     | `/category/babies`  | ✅ Funcional    | 5 productos, conectado a allMockProducts                          |
| Categoría Niñas     | `/category/girls`   | ✅ Funcional    | 4 productos, conectado a allMockProducts                          |
| Categoría Niños     | `/category/boys`    | ✅ Funcional    | 4 productos, conectado a allMockProducts                          |
| Ofertas             | `/category/sales`   | ✅ Funcional    | Filtra `isOnSale: true`                                           |
| Esenciales          | `/essentials`       | ✅ Funcional    | 3 productos, categoría "Essentials"                               |
| Todos los productos | `/products`         | ✅ Funcional    | 17 productos del catálogo unificado                               |
| Detalle de producto | `/products/[id]`    | ✅ Funcional    | Galería, tallas, colores, relacionados, breadcrumb                |
| Carrito             | `/carrito`          | ✅ Funcional    | Edición de cantidad, AlertDialog para vaciar                      |
| Checkout            | `/checkout-flow`    | ✅ Funcional    | 4 pasos, Luhn, isSubmitting guard, validación unificada           |
| 404                 | `/[ruta-invalida]`  | ✅ Funcional    | `not-found.tsx` con branding y CTAs                               |
| Error runtime       | —                   | ✅ Funcional    | `error.tsx` con botón reset y branding                            |
| Cart Context        | —                   | ✅ Sólido       | Provider + localStorage, extensible                               |
| Favorites hook      | —                   | ✅ Funcional    | `useFavorites(id)` con localStorage — persiste entre navegaciones |
| Sistema de tema     | `globals.css`       | ✅ Sólido       | OKLCH variables, dark mode ready                                  |
| Store config        | `store.config.ts`   | ✅ Centralizado | Brand, nav, rutas, categorías, pagos, social, contacto            |
| Validación          | `lib/validation.ts` | ✅ Centralizado | Luhn, getCardType, validateShipping, validatePayment              |
| Mock data           | `lib/mock-data.ts`  | ✅ Unificado    | 17 productos, IDs consistentes, un solo array                     |

---

## Módulos Faltantes

### 🟠 P1 — Importantes para release

| Módulo                    | Ruta                | Descripción                                                                              |
| ------------------------- | ------------------- | ---------------------------------------------------------------------------------------- |
| **Buscador**              | `/search?q=`        | Barra en el header + página de resultados filtrando por nombre/categoría.                |
| **Breadcrumbs**           | Componente global   | Orientación en categorías y detalle. Componente `breadcrumb.tsx` ya existe en shadcn/ui. |
| **Filtros en categorías** | `category-page.tsx` | Por precio, talla, color. Sidebar en desktop, drawer en móvil.                           |

### 🟡 P2 — Segunda iteración

| Módulo                   | Ruta                  | Descripción                                                                                                |
| ------------------------ | --------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Página /favoritos**    | `/favoritos`          | El hook `useFavorites` ya existe con localStorage. Solo falta la página que liste los productos favoritos. |
| **Banner de promoción**  | `layout.tsx` (header) | Barra superior con mensaje de envío gratis o countdown de oferta. Colapsable.                              |
| **Imágenes reales**      | `public/`             | La mayoría usa `/placeholder.svg`. Requiere assets reales o integración con Cloudinary/Sanity.             |
| **Página de cuenta**     | `/cuenta`             | Login/registro básico, mock con localStorage hasta que haya backend.                                       |
| **Historial de pedidos** | `/cuenta/pedidos`     | Lista de órdenes simuladas.                                                                                |

### 🟢 P3 — Polish y SEO

| Módulo                       | Ruta                  | Descripción                                                                                             |
| ---------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------- |
| **Página de éxito de orden** | `/order-success/[id]` | `OrderConfirmation` hoy vive dentro del checkout. Debería ser página independiente con URL compartible. |
| **SEO por página**           | `generateMetadata()`  | Cada página de categoría y detalle debe exportar metadata con título, descripción y OG tags.            |
| **Sitemap**                  | `app/sitemap.ts`      | Generación automática para SEO.                                                                         |
| **robots.txt**               | `public/robots.txt`   | Archivo básico.                                                                                         |

---

## Bugs Resueltos (historial)

### P0 ✅

| Bug                                         | Solución                                                           |
| ------------------------------------------- | ------------------------------------------------------------------ |
| Sin nav móvil                               | `MobileNav` con hamburger + Sheet drawer                           |
| `priority={true}` en todos los ProductCards | Prop opcional, solo primeras 4 cards above-the-fold                |
| Touch targets de 10px en dots               | Botones con área táctil 44×44px, punto visual con `<span>` interno |
| Skeleton permanente en carrito              | Eliminado — se reimplementará con datos reales                     |

### P1 ✅

| Bug                                    | Solución                                                               |
| -------------------------------------- | ---------------------------------------------------------------------- |
| Dos sistemas de toast                  | `react-hot-toast` eliminado, todo migrado a Sonner                     |
| `window.location.href` en checkout     | `router.push()` de `next/navigation`                                   |
| `window.confirm()` para vaciar carrito | `AlertDialog` de shadcn/ui                                             |
| Botón favorito sin `aria-label`        | `aria-label` + `aria-pressed` en ProductCard                           |
| Radio buttons de pago sin ARIA         | `role="radiogroup"` + `role="radio"` + `aria-checked` + teclado ↑↓     |
| Fuentes genéricas (Montserrat + Inter) | Body → Atkinson Hyperlegible; `font-montserrat` alias → `font-display` |

### P2 ✅

| Bug                                       | Solución                                                                |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| Dos catálogos de productos                | `mockProducts` eliminado, 17 productos en `allMockProducts`             |
| Footer hardcodeaba datos de marca         | Footer lee `social.*` y `contact.*` de `store.config.ts`                |
| Checkout sin guard de doble envío         | `isSubmitting` state en `handleOrderConfirm`                            |
| Estado de favoritos efímero               | `useFavorites(id)` hook con localStorage                                |
| Validación duplicada en checkout          | `src/lib/validation.ts` — fuente única de verdad                        |
| `brand-accent` alias en store.config      | Reemplazado por `brand-base`                                            |
| `font-montserrat` en shipping-form        | Reemplazado por `font-display`                                          |
| Sin páginas de error/404                  | `not-found.tsx` + `error.tsx` con branding                              |
| Sin `.env.local.example`                  | Creado con secciones para MercadoPago, Stripe, Sanity, Analytics, Email |
| README.md era template de create-next-app | Reescrito con stack real, comandos yarn, links a docs                   |
| PROJECT.md decía Next.js 14               | Actualizado a Next.js 15.3.3 + Turbopack                                |
| `console.log` en ProductCard              | Eliminado                                                               |
| Estado `isHovered` en ProductCard         | Eliminado — `group-hover:` Tailwind puro                                |
| `src/lib/fonts.ts` sin usar               | Eliminado                                                               |
| Hero `100vh`                              | Migrado a `100dvh`                                                      |
| Alt text en imágenes decorativas del hero | `alt=""` en todas las imágenes de background                            |
| `<nav>` sin aria-label                    | `aria-label="Navegación principal"` en desktop y móvil                  |

---

## Deuda de Identidad Visual (requiere decisión)

| Anti-patrón                              | Estado                     | Fix                                     |
| ---------------------------------------- | -------------------------- | --------------------------------------- |
| Tipografía display genérica (Montserrat) | ⏳ Pendiente decisión      | Baloo 2 o Nunito → `/typeset`           |
| Color de acento incorrecto               | ⏳ Pendiente decisión      | Terracota o durazno → `/colorize`       |
| Hero genérico centrado                   | ⏳ Bloqueo: paleta primero | Composición asimétrica, texto izquierda |
| Icon grid de features                    | ⏳ Bloqueo: paleta primero | Banda/estadísticas con personalidad     |
| Centrado total en headings               | ⏳ Bloqueo: paleta primero | Variar alineación por sección           |

---

## Plan de Ejecución

### ✅ Bloque 0 — Fundación

```
[x] Scaffolding Next.js 15, Tailwind v4, shadcn/ui, TypeScript
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
[x] Unificar sistema de toast → Sonner
[x] window.confirm → AlertDialog
[x] Fix priority={true} en ProductCards
[x] Fix touch targets en banner dots
[x] Eliminar skeleton permanente del carrito
[x] ARIA radio buttons PaymentForm
[x] Prettier + ESLint + pipeline yarn validate
```

### ✅ Bloque 3 — Limpieza de deuda técnica

```
[x] Unificar catálogos → eliminar mockProducts, 17 productos en allMockProducts
[x] Conectar footer a store.config.ts (social.*, contact.*)
[x] Extraer src/lib/validation.ts (Luhn + shipping + payment)
[x] useFavorites hook con localStorage
[x] isSubmitting en checkout (prevenir doble cobro)
[x] Migrar aliases legacy (brand-accent → brand-base, font-montserrat → font-display)
[x] .env.local.example con secciones por servicio
[x] README.md reescrito
[x] PROJECT.md: Next.js 14 → 15.3.3
```

### ⏳ Bloque 4 — Identidad visual (requiere decisión de paleta/tipografía)

```
[ ] Commit tipografía display final (Baloo 2 o Nunito)
[ ] Commit paleta final (acento + superficie)
[ ] Rediseñar hero — composición asimétrica
[ ] Reemplazar icon grid por sección con personalidad
```

### ⏳ Bloque 5 — Features P1

```
[ ] Buscador (header + /search?q= página de resultados)
[ ] Breadcrumbs en categorías y detalle de producto
[ ] Filtros en páginas de categoría (precio, talla, color)
```

### ⏳ Bloque 6 — Features P2

```
[ ] Página /favoritos (hook ya existe, falta la página)
[ ] Banner de promoción en header
[ ] Imágenes reales de productos
```

### ⏳ Bloque 7 — SEO + Polish

```
[ ] generateMetadata() por página (categorías, detalle, home)
[ ] sitemap.ts automático
[ ] robots.txt
[ ] Página /order-success/[id] independiente
[ ] Re-audit completo (objetivo: 20/20)
```

### ⏳ Bloque 8 — Producción real

```
[ ] Deploy en Vercel con dominio real
[ ] Integración Sanity CMS + imágenes reales
[ ] Integración MercadoPago (Checkout Bricks recomendado)
[ ] Google Analytics 4 + Meta Pixel
[ ] Email transaccional (confirmaciones, abandono de carrito)
```

---

## Arquitectura de Referencia (estado actual)

```
src/
├── app/
│   ├── layout.tsx              ← Header + Footer + CartProvider
│   ├── page.tsx                ← Home
│   ├── not-found.tsx           ← 404 con branding ✅
│   ├── error.tsx               ← Error runtime con branding ✅
│   ├── sitemap.ts              ← SEO (pendiente)
│   ├── carrito/page.tsx        ← Carrito con AlertDialog
│   ├── checkout-flow/page.tsx  ← 4 pasos, isSubmitting guard
│   ├── essentials/page.tsx
│   ├── products/
│   │   ├── page.tsx            ← Todos los productos (17)
│   │   └── [id]/page.tsx       ← Detalle ✅
│   ├── search/page.tsx         ← (PENDIENTE)
│   ├── favoritos/page.tsx      ← (PENDIENTE — hook ya listo)
│   └── category/
│       ├── babies/page.tsx
│       ├── girls/page.tsx
│       ├── boys/page.tsx
│       └── sales/page.tsx
├── components/
│   ├── cart/                   ← Sistema completo (7 archivos)
│   ├── category/               ← CategoryPage + SalesPage
│   ├── checkout/               ← 5 pasos
│   ├── layout/
│   │   ├── mobile-nav.tsx      ← Hamburger + Sheet ✅
│   │   └── footer.tsx          ← Conectado a store.config ✅
│   ├── product/
│   │   └── product-card.tsx    ← useFavorites, priority prop ✅
│   └── ui/                     ← shadcn/ui (50+ componentes)
├── config/
│   ├── store.config.ts         ← Fuente de verdad: brand, nav, rutas, social, contact
│   └── theme.config.ts         ← Paleta OKLCH + tipografía
├── hooks/
│   ├── use-cart.ts             ← Wrapper del CartContext
│   ├── use-favorites.ts        ← localStorage por ID ✅
│   ├── use-mobile.tsx          ← Breakpoint 768px
│   └── use-sonner.ts           ← Toast unificado
└── lib/
    ├── mock-data.ts            ← 17 productos, allMockProducts, helpers ✅
    ├── types.ts                ← Product, CartItem, CartContextType
    ├── validation.ts           ← Luhn + validateShipping + validatePayment ✅
    └── utils.ts                ← cn() utility
```

---

_Para análisis técnico de issues pendientes ver `AUDIT.md`. Para visión de negocio ver `PROJECT.md`._
