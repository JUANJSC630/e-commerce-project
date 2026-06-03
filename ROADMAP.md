# Roadmap — Dulce Infancia Shop
> Actualizado: 2026-06-03 | Score técnico base: 6/20 → estimado actual: **12/20** (ver AUDIT.md)

---

## Estado General

El esqueleto del e-commerce está construido con Next.js 14 App Router, Tailwind CSS v4, shadcn/ui y mock-data. El flujo carrito → checkout existe y funciona. Sin embargo, faltan módulos clave para que el sitio sea usable en producción, hay deuda técnica documentada en `AUDIT.md`, y toda la capa visual tiene oportunidades de mejora.

---

## Módulos Existentes

| Módulo | Ruta | Estado | Notas |
|--------|------|--------|-------|
| Home | `/` | ✅ Funcional | Hero carousel, grid productos, features section |
| Categoría Bebés | `/category/babies` | ✅ Funcional | Conectado a mock-data |
| Categoría Niñas | `/category/girls` | ✅ Funcional | Conectado a mock-data |
| Categoría Niños | `/category/boys` | ✅ Funcional | Conectado a mock-data |
| Ofertas | `/category/sales` | ✅ Funcional | Filtra productos con `isOnSale` |
| Esenciales | `/essentials` | ✅ Funcional | Categoría especial |
| Todos los productos | `/products` | ✅ Funcional | Grilla completa, simulación de loading |
| Carrito | `/carrito` | ⚠️ Parcial | Funciona, bugs activos (ver sección bugs) |
| Checkout flow | `/checkout-flow` | ⚠️ Parcial | Multi-paso, bugs activos (ver sección bugs) |
| Cart Context | — | ✅ Sólido | Provider/Context limpio y extensible |
| Sistema de tema | `globals.css` | ✅ Base buena | OKLCH variables, dark mode ready |
| Store config | `store.config.ts` | ✅ Centralizado | Brand, nav, rutas, categorías, pagos |
| Mock data | `lib/mock-data.ts` | ✅ Completo | Productos en español con tipos correctos |

---

## Módulos Faltantes

### 🔴 P0 — Bloquean uso real

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| Menú hamburger / nav móvil | `layout.tsx` | El `<nav>` está con `hidden md:flex`. En móvil NO hay forma de navegar. Implementar botón hamburger que abra un `Sheet` con los links del nav. | ✅ Completado |
| **Página de detalle de producto** | `/products/[id]` | Imagen, talla/color selector, descripción, CTA agregar al carrito, productos relacionados, breadcrumb. | ✅ Completado |
| **Footer** | `layout.tsx` → `components/layout/footer.tsx` | 4 columnas: marca + redes, colecciones, ayuda, información/moneda. | ✅ Completado |

### 🟠 P1 — Importantes para release

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| **Buscador** | `/search?q=` | Barra de búsqueda en el header + página de resultados filtrando mock-data por nombre/categoría. |
| **Breadcrumbs** | Componente global | Orientación del usuario en categorías y detalle. Componente `breadcrumb.tsx` ya existe en shadcn/ui. |
| **Filtros en categorías** | Componente en `category-page.tsx` | Filtrar por precio, talla, color. Sidebar en desktop, drawer en móvil. |

### 🟡 P2 — Para una segunda iteración

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| **Wishlist / Favoritos** | `/favoritos` | El botón corazón en ProductCard existe pero no persiste. Implementar con localStorage o Context similar al carrito. |
| **Página de cuenta** | `/cuenta` | Login/registro básico. Sin backend real, puede ser mock con localStorage. |
| **Historial de pedidos** | `/cuenta/pedidos` | Lista de órdenes simuladas. |
| **Imágenes reales** | `public/` | Todo usa `/placeholder.svg`. Requiere assets reales o servicio como Unsplash/Cloudinary. |
| **Banner de promoción** | `layout.tsx` (header) | Barra superior con mensaje de envío gratuito u oferta. Colapsable. |

### 🟢 P3 — Polish post-lanzamiento

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| **Página 404 personalizada** | `app/not-found.tsx` | Usa el default de Next.js. Crear con branding y links de vuelta. |
| **Página de éxito de orden** | `/order-success/[id]` | Actualmente `OrderConfirmation` vive dentro del checkout flow. Debería ser página independiente para permitir compartir URL. |
| **SEO por página** | `generateMetadata()` | Cada página de categoría y detalle debería exportar metadata con título, descripción y OG tags. |
| **Sitemap** | `app/sitemap.ts` | Generación automática del sitemap para SEO. |
| **robots.txt** | `public/robots.txt` | Archivo básico. |

---

## Bugs Activos (del AUDIT.md)

### 🔴 P0 — Fix inmediato

| # | Bug | Archivo | Estado |
|---|-----|---------|--------|
| B1 | Sin nav móvil | `layout.tsx` + `mobile-nav.tsx` (nuevo) | ✅ Resuelto |
| B2 | `priority={true}` en TODOS los ProductCards | `product-card.tsx` | ✅ Resuelto |
| B3 | Touch targets de 10px en dots del banner | `page.tsx` | ✅ Resuelto |
| B4 | Skeleton permanente en carrito | `carrito/page.tsx` | ✅ Resuelto |

### 🟠 P1 — Antes de release

| # | Bug | Archivo | Estado |
|---|-----|---------|--------|
| B5 | Dos sistemas de toast (`react-hot-toast` + `sonner`) | `layout.tsx`, `checkout-flow`, `add-to-cart-button` | ✅ Resuelto |
| B6 | `window.location.href` en checkout | `checkout-flow/page.tsx` | ✅ Resuelto |
| B7 | `window.confirm()` para vaciar carrito | `carrito/page.tsx` | ✅ Resuelto |
| B8 | Botón favorito sin `aria-label` | `product-card.tsx` | ✅ Resuelto |
| B9 | Radio buttons de pago sin roles ARIA | `payment-form.tsx` | ✅ Resuelto |
| B10 | Fuentes Montserrat + Inter (genéricas) | `layout.tsx` | ✅ Resuelto |

### 🟡 P2 — Siguiente iteración

| # | Bug | Archivo | Estado |
|---|-----|---------|--------|
| B11 | Colores hex hardcodeados fuera del sistema de tokens | `tailwind.config.ts` | ⏳ Pendiente |
| B12 | `console.log` en producción | `product-card.tsx` | ✅ Resuelto |
| B13 | Estado `isHovered` causa re-renders excesivos | `product-card.tsx` | ✅ Resuelto |
| B14 | Validación duplicada en checkout | `checkout-flow/page.tsx` + `payment-form.tsx` | ⏳ Pendiente |
| B15 | `src/lib/fonts.ts` nunca importado | `lib/fonts.ts` | ✅ Resuelto |
| B16 | Hero `100vh` → `100dvh` | `page.tsx` | ✅ Resuelto |
| B17 | Alt text en imágenes decorativas del hero | `page.tsx` | ✅ Resuelto |

---

## Deuda de Identidad Visual

El AUDIT detectó que el diseño actual parece generado por IA:

| Anti-patrón | Manifestación | Fix |
|-------------|---------------|-----|
| Tipografía monocultivo | Montserrat + Inter | Ver B10 arriba |
| Icon grid de features | 4 cards idénticas con icono + texto | Rediseñar sección con más personalidad |
| Hero genérico centrado | Overlay + título centrado + botón CTA | Composición asimétrica, texto a la izquierda |
| Centrado total | Casi todos los headings en `text-center` | Variar alineación por sección |
| ProductCards uniformes | Grid idéntico sin variación | Alternar tamaños de cards en featured sections |

---

## Plan de Ejecución (orden recomendado)

### Fase 1 — Funcionalidad base  ✅ COMPLETADO
```
[x] Página detalle de producto /products/[id]  — módulo nuevo
[x] Footer completo con links y copyright       — módulo nuevo
```

> Nav móvil ya completado en la sesión anterior.

### Fase 2 — Bug fixes críticos  ✅ COMPLETADO
```
[x] Unificar toast → sonner, eliminar react-hot-toast
[x] window.confirm → AlertDialog
[x] window.location.href → router.push
[x] Fix priority={true} en ProductCards
[x] Fix touch targets en banner dots
[x] Eliminar skeleton permanente del carrito
[x] Eliminar console.logs
[x] Eliminar fonts.ts sin usar
[x] Hero height 100vh → 100dvh
[x] ARIA radio buttons PaymentForm
[x] Nav móvil hamburger + drawer
```

### Fase 3 — Identidad visual  ⏳ EN PROGRESO
```
[x] Nueva tipografía (Atkinson Hyperlegible body font)  — B10
[ ] Migrar colores hex brand a CSS vars OKLCH             — B11
[ ] Extraer validación a lib/validation.ts               — B14
```

### Fase 4 — Módulos P1
```
[ ] Buscador (header + página de resultados)
[ ] Breadcrumbs en categorías y detalle
[ ] Filtros en páginas de categoría
```

### Fase 5 — Módulos P2
```
[ ] Wishlist con localStorage
[ ] Imágenes reales de productos
[ ] Banner de promoción en header
```

### Fase 6 — Polish y SEO
```
[ ] Página 404 personalizada
[ ] generateMetadata() por página
[ ] sitemap.ts
[ ] robots.txt
[ ] Re-audit para medir mejora de score (objetivo: ≥ 14/20)
```

---

## Arquitectura de Referencia

```
src/
├── app/
│   ├── layout.tsx              ← Header + Footer + Providers
│   ├── page.tsx                ← Home
│   ├── not-found.tsx           ← 404 (pendiente)
│   ├── sitemap.ts              ← SEO (pendiente)
│   ├── carrito/page.tsx
│   ├── checkout-flow/page.tsx
│   ├── essentials/page.tsx
│   ├── products/
│   │   ├── page.tsx            ← Todos los productos
│   │   └── [id]/page.tsx       ← Detalle ✅ Completado
│   ├── search/page.tsx         ← Resultados búsqueda (PENDIENTE)
│   ├── favoritos/page.tsx      ← Wishlist (PENDIENTE)
│   ├── cuenta/                 ← Auth area (PENDIENTE)
│   └── category/
│       ├── babies/page.tsx
│       ├── girls/page.tsx
│       ├── boys/page.tsx
│       └── sales/page.tsx
├── components/
│   ├── cart/                   ← Sistema de carrito completo
│   ├── category/               ← CategoryPage + SalesPage
│   ├── checkout/               ← Pasos del checkout
│   ├── layout/
│   │   ├── mobile-nav.tsx      ← Nav hamburger ✅
│   │   └── footer.tsx          ← Footer completo ✅
│   ├── product/
│   │   └── product-card.tsx    ← Clickeable → /products/[id] ✅
│   └── ui/                     ← shadcn/ui components
├── config/
│   ├── store.config.ts         ← Config central de la tienda
│   └── theme.config.ts
├── hooks/
│   ├── use-cart.ts
│   └── use-sonner.ts           ← Toast unificado (migrar react-hot-toast a esto)
└── lib/
    ├── mock-data.ts            ← + getProductById, getRelatedProducts ✅
    ├── types.ts
    ├── validation.ts           ← (PENDIENTE — extraer de checkout)
    └── utils.ts
```

---

*Para el análisis técnico completo de issues existentes ver `AUDIT.md`*
