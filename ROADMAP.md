# Roadmap — Dulce Infancia Shop

> Actualizado: 2026-06-03 | Score técnico frontend: **20/20** ✅
> **Objetivo final**: e-commerce 100% administrable — productos, imágenes, inventario y pedidos desde un dashboard sin tocar código.

---

## Estado General

El **frontend está completo y sólido**. Flujo home → categoría → detalle → carrito → checkout funciona, identidad visual aplicada, arquitectura SOLID. Sin embargo, toda la tienda corre sobre datos hardcodeados en un archivo TypeScript. Para agregar un producto hoy hay que editar código, hacer commit y deployar. Eso cambia completamente a partir del Bloque 6.

---

## Decisiones Arquitectónicas Pendientes

Antes de arrancar el Bloque 6 hay que tomar estas decisiones. Sin ellas, cualquier trabajo de backend puede necesitar rehacerse.

### Decisión 1 — Stack de gestión de contenido y productos

| Opción                                   | Admin incluido                  | Imágenes                        | Inventario            | Para quién                                        |
| ---------------------------------------- | ------------------------------- | ------------------------------- | --------------------- | ------------------------------------------------- |
| **Sanity CMS + Supabase** ⭐             | Sanity Studio (visual, no-code) | CDN Sanity con transformaciones | Supabase (PostgreSQL) | Mejor balance velocidad/control                   |
| **Medusa.js**                            | Admin completo de e-commerce    | Cualquier proveedor             | Nativo por variante   | Si se necesita e-commerce completo out-of-the-box |
| **Custom (Next.js + Prisma + Supabase)** | Construir desde cero            | Supabase Storage / Cloudinary   | Personalizado         | Máximo control, máximo tiempo                     |

**Recomendación**: Sanity + Supabase — Sanity Studio es la mejor interfaz de admin del mercado para contenido y productos. Supabase cubre pedidos, inventario y autenticación. El frontend Next.js ya construido necesita cambios mínimos.

### Decisión 2 — Almacenamiento de imágenes

| Opción                               | Costo             | Transformaciones automáticas  |
| ------------------------------------ | ----------------- | ----------------------------- |
| **Sanity CDN** (incluido con Sanity) | Gratis hasta 20GB | Sí (resize, WebP, AVIF, crop) |
| **Cloudinary**                       | Gratis hasta 25GB | Sí (el más potente)           |
| **Supabase Storage**                 | Gratis hasta 1GB  | No                            |

### Decisión 3 — Autenticación del admin

| Opción                                           | Integración                  | Costo                |
| ------------------------------------------------ | ---------------------------- | -------------------- |
| **Supabase Auth** (recomendado si usas Supabase) | Nativa con la base de datos  | Gratis               |
| **NextAuth.js**                                  | Flexible, cualquier provider | Gratis               |
| **Clerk**                                        | La más fácil de implementar  | Gratis hasta 10k MAU |

---

## Brechas Críticas del Código Actual

Estos son bugs y problemas reales que existen HOY en el código, independientemente del stack que se elija. Se corrigen en el Bloque 6.

### `src/app/products/page.tsx` — 4 problemas

| Problema                          | Detalle                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------ |
| `"use client"` innecesario        | No usa estado ni efectos propios del cliente — puede ser Server Component      |
| Fake 800ms delay con `setTimeout` | Simula una carga que no existe, solo deteriora la experiencia                  |
| `brand-coral` no existe           | Token de color que no está definido en el sistema de diseño — falla silencioso |
| `xl:grid-cols-5`                  | Raro para un grid de productos, rompe el layout en pantallas anchas            |

### `src/app/products/[id]/page.tsx` — 2 problemas

| Problema                         | Detalle                                                                                        |
| -------------------------------- | ---------------------------------------------------------------------------------------------- |
| `useState(false)` para favoritos | Debería usar `useFavorites(product.id)` — el estado se pierde al navegar                       |
| `categoryLabel` mapa duplicado   | Traduce "Babies" → "Bebés" inline, pero esa lógica ya existe en `store.config.ts → categories` |

### `src/lib/types.ts` — El modelo de datos es insuficiente

El tipo `Product` actual no puede representar un producto real administrable:

```typescript
// ❌ HOY — no soporta admin real
interface Product {
  id: string
  name: string
  price: number
  image: string // una sola imagen
  category?: string // string libre, no relación
  sizes?: string[] // sin stock por talla
  colors?: string[] // solo hex, sin nombre
}

// ✅ NECESARIO — para admin + inventario real
interface Product {
  id: string
  slug: string // URL: /products/body-algodon-nubes
  name: string
  description: string
  price: number
  compareAtPrice?: number // precio original tachado
  category: string // relación a Category
  images: ProductImage[] // múltiples imágenes con orden
  variants: ProductVariant[] // talla+color con stock propio
  isPublished: boolean // borrador o publicado
  isFeatured: boolean // aparece en homepage
  tags?: string[]
}

interface ProductVariant {
  id: string
  sku: string // código único por talla+color
  size: string
  color: string
  colorName: string // "Verde", no "#3E3A3B"
  stock: number // inventario real
  lowStockThreshold: number // alerta de stock bajo
}

interface ProductImage {
  url: string
  alt: string
  order: number
}
```

### `src/app/checkout-flow/page.tsx` — El pedido no se guarda

```typescript
// ❌ HOY — el pedido desaparece después de este toast
const handleOrderConfirm = () => {
  toast.success("¡Pedido confirmado!")
  setTimeout(() => {
    clearCart()
    router.push(routes.home)
  }, 2000)
}

// ✅ NECESARIO — el pedido debe persistir en la base de datos
const handleOrderConfirm = async () => {
  const order = await createOrder({
    // POST /api/orders
    items: cartItems,
    shipping: shippingData,
    payment: paymentData,
    total: getTotal(),
  })
  clearCart()
  router.push(`/order-success/${order.id}`) // URL compartible
}
```

---

## Módulos Existentes

| Módulo              | Ruta               | Estado          | Notas                                                      |
| ------------------- | ------------------ | --------------- | ---------------------------------------------------------- |
| Home                | `/`                | ✅ Sólido       | Hero split 45/55, trust bar marquee, brand promise         |
| Categoría Bebés     | `/category/babies` | ✅ Funcional    | 5 productos mock                                           |
| Categoría Niñas     | `/category/girls`  | ✅ Funcional    | 4 productos mock                                           |
| Categoría Niños     | `/category/boys`   | ✅ Funcional    | 4 productos mock                                           |
| Ofertas             | `/category/sales`  | ✅ Funcional    | Filtra `isOnSale: true`                                    |
| Esenciales          | `/essentials`      | ✅ Funcional    | 3 productos mock                                           |
| Todos los productos | `/products`        | ⚠️ Bugs         | Ver brechas arriba — fake delay, brand-coral, "use client" |
| Detalle de producto | `/products/[id]`   | ⚠️ Bugs         | `useFavorites` no usado, categoryLabel duplicado           |
| Carrito             | `/carrito`         | ✅ Funcional    | AlertDialog, edición de cantidad                           |
| Checkout            | `/checkout-flow`   | ⚠️ Incompleto   | Valida y confirma pero **no guarda el pedido**             |
| 404                 | —                  | ✅ Funcional    | Branding + CTAs                                            |
| Error               | —                  | ✅ Funcional    | Botón reset + branding                                     |
| Cart Context        | —                  | ✅ Sólido       | localStorage, extensible                                   |
| useFavorites        | —                  | ✅ Funcional    | localStorage, persiste entre navegaciones                  |
| Sistema de tema     | —                  | ✅ Sólido       | OKLCH, Nunito, beige + verde salvia                        |
| store.config.ts     | —                  | ✅ Centralizado | Brand, nav, rutas, pagos, social, homeContent              |
| validation.ts       | —                  | ✅ Centralizado | Luhn, shipping, payment                                    |
| mock-data.ts        | —                  | ✅ Temporal     | 17 productos — se reemplaza con Sanity en Bloque 8         |

---

## Plan de Ejecución Completo

### ✅ Bloques 0–5 — Completados

Ver historial al final del documento.

---

### ⏳ Bloque 6 — Correcciones de código + SEO base

> **Objetivo**: Limpiar los bugs existentes y dejar el frontend listo para ser indexado. No requiere decisiones de stack.

```
[ ] FIX: products/page.tsx → Server Component, eliminar fake delay, eliminar brand-coral
[ ] FIX: products/[id]/page.tsx → usar useFavorites(id), leer categoryLabel de config
[ ] FIX: types.ts → extender Product con slug, images[], variants[], isPublished, isFeatured
[ ] FIX: checkout → handleOrderConfirm prepara estructura para POST /api/orders

[ ] SEO: robots.txt en public/
[ ] SEO: sitemap.ts en app/
[ ] SEO: generateMetadata() en home, /products, /products/[id], todas las categorías

[ ] UX: Breadcrumbs en páginas de categoría y detalle (breadcrumb.tsx ya existe en shadcn/ui)
[ ] UX: Página /favoritos (useFavorites ya existe, solo falta la página)
```

---

### ⏳ Bloque 7 — Features de navegación y descubrimiento

> **Objetivo**: Que el usuario pueda encontrar lo que busca. Trabaja sobre mock-data (se migra en Bloque 8).

```
[ ] Buscador en header + página /search?q= (filtra nombre/categoría/descripción)
[ ] Filtros en páginas de categoría (precio, talla, color) — sidebar desktop, drawer mobile
[ ] Banner de promoción colapsable en header (envío gratis, ofertas)
[ ] Página /favoritos con lista de productos y estado de stock
```

---

### ⏳ Bloque 8 — Backend: Sanity CMS para productos e imágenes

> **Objetivo**: Agregar, editar y eliminar productos desde Sanity Studio sin tocar código. Las imágenes se suben desde el Studio y se sirven por el CDN de Sanity.

**Prerequisito**: Tener tomadas las Decisiones 1 y 2 de arriba.

#### Setup Sanity

```
[ ] Crear proyecto en sanity.io
[ ] Definir schema: Product, ProductVariant, Category, HeroBanner
[ ] Configurar Sanity Studio en /admin/studio (o studio.dulceinfancia.co)
[ ] Agregar NEXT_PUBLIC_SANITY_PROJECT_ID y SANITY_API_TOKEN al .env.local
[ ] Proteger Studio con autenticación (Sanity Auth)
```

#### Migración del frontend

```
[ ] Crear src/lib/sanity.ts con cliente GROQ y queries tipadas
[ ] Crear src/lib/sanity-queries.ts:
    - getProducts(filters?) → reemplaza allMockProducts
    - getProductBySlug(slug) → reemplaza getProductById
    - getFeaturedProducts(limit) → reemplaza getFeaturedProducts
    - getProductsByCategory(categoryKey) → reemplaza getProductsByCategory
    - getCategories() → categorías dinámicas desde Sanity
    - getHeroBanners() → banners desde Sanity (no hardcoded en store.config)
[ ] Actualizar todas las páginas para usar queries Sanity en lugar de mock-data
[ ] Actualizar types.ts con tipos generados por Sanity (sanity generate)
[ ] Configurar ISR (revalidate) o On-demand revalidation vía webhook
[ ] Webhook: cuando se publica un producto en Sanity → revalida las páginas afectadas
[ ] Eliminar src/lib/mock-data.ts una vez migrado
```

#### Gestión de imágenes (CDN Sanity)

```
[ ] Usar @sanity/image-url para construir URLs con transformaciones
[ ] Configurar next.config.ts para permitir cdn.sanity.io como dominio de imágenes
[ ] Todas las imágenes de producto se sirven desde CDN Sanity (WebP automático)
[ ] Placeholder blur hash automático vía Sanity image metadata
```

#### Lo que el admin puede hacer desde Sanity Studio

```
✅ Crear producto (nombre, precio, descripción, categoría)
✅ Subir múltiples imágenes por producto (drag & drop, crop, reorder)
✅ Definir variantes (talla + color + nombre de color)
✅ Publicar / despublicar productos (borrador vs activo)
✅ Marcar productos como "Nuevo" o "En oferta"
✅ Gestionar categorías (nombre, imagen, slug)
✅ Editar los banners del hero de la homepage
✅ Todo se refleja en la tienda en tiempo real (ISR / webhook)
```

---

### ⏳ Bloque 9 — Backend: Supabase para pedidos e inventario

> **Objetivo**: Los pedidos se guardan en la base de datos. El inventario se descuenta automáticamente. El admin puede ver y gestionar pedidos.

**Prerequisito**: Bloque 8 completado (productos reales en Sanity).

#### Setup Supabase

```
[ ] Crear proyecto en supabase.com
[ ] Agregar SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY al .env.local
[ ] Configurar autenticación de admin (Supabase Auth o NextAuth)
```

#### Schema de base de datos (PostgreSQL via Supabase)

```sql
-- Pedidos
orders (
  id uuid PRIMARY KEY,
  order_number text UNIQUE,   -- DI-2026-001
  status text,                -- pending | confirmed | shipped | delivered | cancelled
  customer_email text,
  customer_name text,
  shipping_address jsonb,
  payment_method text,
  payment_status text,        -- pending | paid | failed
  subtotal integer,           -- en centavos COP
  shipping_cost integer,
  total integer,
  created_at timestamptz
)

-- Items del pedido
order_items (
  id uuid PRIMARY KEY,
  order_id uuid REFERENCES orders,
  product_id text,            -- ID del producto en Sanity
  variant_sku text,           -- talla + color
  product_name text,
  size text,
  color text,
  price integer,
  quantity integer
)

-- Inventario (sincronizado con variantes de Sanity)
inventory (
  variant_sku text PRIMARY KEY,
  product_id text,
  stock integer,
  reserved integer,           -- en carrito pero no comprado
  low_stock_threshold integer
)
```

#### API Routes a crear

```
[ ] POST /api/orders
    - Valida los items (stock disponible)
    - Crea el registro en orders + order_items
    - Descuenta stock en inventory
    - Genera número de orden (DI-2026-001)
    - Retorna { orderId, orderNumber }

[ ] GET  /api/orders/[id]
    - Retorna el pedido completo (para /order-success/[id])
    - Autenticado: retorna cualquier pedido
    - Sin auth: solo si el email coincide

[ ] GET  /api/admin/orders
    - Lista paginada de todos los pedidos
    - Solo accesible con rol admin

[ ] PATCH /api/admin/orders/[id]
    - Actualiza estado del pedido (confirmed → shipped → delivered)
    - Solo accesible con rol admin

[ ] GET  /api/inventory/check
    - Verifica stock de un array de variantes
    - Usado por el carrito antes del checkout
```

#### Cambios en el frontend

```
[ ] checkout-flow/page.tsx → handleOrderConfirm llama POST /api/orders
[ ] Nueva página /order-success/[id] → muestra resumen del pedido guardado
[ ] CarritoPage → verificar stock antes de ir al checkout
[ ] ProductCard + detalle → mostrar "Sin stock" si stock = 0
[ ] ProductCard + detalle → badge "Últimas X unidades" si stock <= threshold
```

---

### ⏳ Bloque 10 — Dashboard de administración

> **Objetivo**: Panel completo en `/admin` para gestionar pedidos, ver inventario y estadísticas básicas. Protegido con autenticación.

```
[ ] Autenticación admin: /admin/login con Supabase Auth o NextAuth
[ ] Middleware protege /admin/** → redirige a /admin/login si no está autenticado

[ ] /admin — Dashboard:
    - Resumen: ventas del día, pedidos pendientes, stock bajo
    - Gráfico de ventas (últimos 30 días)
    - Acceso rápido a acciones frecuentes

[ ] /admin/pedidos — Lista de pedidos:
    - Tabla paginada: número, cliente, fecha, total, estado
    - Filtros por estado y fecha
    - Exportar a CSV

[ ] /admin/pedidos/[id] — Detalle de pedido:
    - Items, dirección de envío, método de pago
    - Timeline de estados con fecha
    - Botón para cambiar estado (pendiente → confirmado → enviado → entregado)
    - Número de guía de envío (Interrapidísimo, Servientrega, Coordinadora)

[ ] /admin/inventario — Stock por variante:
    - Tabla de todas las variantes con stock actual
    - Edición inline del stock
    - Alertas de stock bajo (<threshold)

[ ] /admin/productos — Vista de catálogo (read-only):
    - Lista de productos de Sanity
    - Link directo a editar en Sanity Studio
    - Stock total por producto
    (La edición de productos vive en Sanity Studio, no aquí)
```

---

### ⏳ Bloque 11 — Pagos reales con MercadoPago

> **Objetivo**: El cliente paga de verdad. El pedido se confirma solo cuando el pago es exitoso.

```
[ ] Crear cuenta de MercadoPago y obtener credenciales
[ ] Agregar MERCADOPAGO_ACCESS_TOKEN y NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY al .env.local
[ ] POST /api/payments/create-preference → crea preferencia de pago en MercadoPago
[ ] Webhook /api/payments/webhook → recibe notificación de pago exitoso/fallido
    - Pago exitoso → actualiza orders.payment_status = 'paid', orders.status = 'confirmed'
    - Pago fallido → actualiza orders.payment_status = 'failed'
[ ] Implementar MercadoPago Checkout Bricks en payment-form.tsx (reemplaza form manual)
[ ] Página de retorno de MercadoPago → /order-success/[id] o /payment-failed

[ ] Flujo protegido contra doble cobro:
    - Verificar idempotency key en cada creación de preferencia
    - El pedido se crea en estado 'pending' antes del pago
    - Solo pasa a 'confirmed' con confirmación de MercadoPago
```

---

### ⏳ Bloque 12 — Email transaccional

> **Objetivo**: El cliente recibe email automático en cada evento importante.

```
[ ] Configurar Resend (recomendado) o MailerLite
[ ] Agregar EMAIL_API_KEY al .env.local

[ ] Email: Confirmación de pedido (se envía al crear el pedido)
    - Número de orden, items con imágenes, total, dirección de envío
    - Diseño con branding Dulce Infancia

[ ] Email: Pedido confirmado (cuando el pago es exitoso)
[ ] Email: Pedido enviado (cuando el admin actualiza estado a 'shipped')
    - Incluye número de guía de envío y link de seguimiento

[ ] Email: Contraseña / bienvenida (cuando el cliente crea cuenta)
[ ] Email: Abandono de carrito (24h después sin completar compra)
```

---

### ⏳ Bloque 13 — Analytics y Marketing

> **Objetivo**: Medir conversiones, entender comportamiento y hacer retargeting.

```
[ ] Google Analytics 4 → /api/analytics o Google Tag Manager
    - Eventos: view_item, add_to_cart, begin_checkout, purchase
    - Embudo de conversión por pasos del checkout

[ ] Meta Pixel (Facebook/Instagram)
    - Eventos: ViewContent, AddToCart, InitiateCheckout, Purchase
    - Audiencias personalizadas para retargeting

[ ] Open Graph por producto (/products/[id] → og:image desde Sanity CDN)
[ ] Twitter Cards para compartir productos en redes
[ ] TikTok Pixel (si los productos viralizan en TikTok)
```

---

### ⏳ Bloque 14 — Cuenta de cliente y post-compra

> **Objetivo**: El cliente puede ver sus pedidos anteriores y gestionar su información.

```
[ ] /cuenta/registro — crear cuenta con email + contraseña
[ ] /cuenta/login — autenticación
[ ] /cuenta — panel: nombre, email, cambiar contraseña
[ ] /cuenta/pedidos — historial de pedidos con estado
[ ] /cuenta/pedidos/[id] — detalle de un pedido específico
[ ] /favoritos — página de productos guardados (useFavorites + persistencia en Supabase si hay cuenta)

[ ] Autenticación: Supabase Auth (mismo sistema que el admin pero con rol 'customer')
[ ] Guest checkout: compra sin cuenta, con opción de crear una al final
```

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
[x] STANDARDS.md — checklist de calidad para cada PR
```

---

## Arquitectura Target (estado final)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ADMIN (sin código)                          │
│                                                                     │
│  Sanity Studio                         /admin (Next.js)             │
│  studio.dulceinfancia.co               dulceinfancia.co/admin       │
│  ┌─────────────────────────┐           ┌─────────────────────────┐  │
│  │ Crear/editar productos  │           │ Ver y gestionar pedidos │  │
│  │ Subir/reordenar fotos   │           │ Actualizar estados      │  │
│  │ Gestionar categorías    │           │ Ver inventario          │  │
│  │ Editar banners del hero │           │ Alertas stock bajo      │  │
│  │ Publicar/despublicar    │           │ Dashboard de ventas     │  │
│  └─────────────────────────┘           └─────────────────────────┘  │
└──────────────────┬──────────────────────────────┬───────────────────┘
                   │                              │
           Sanity API + CDN                Supabase (PostgreSQL)
           (productos, imágenes)           (pedidos, inventario, clientes)
                   │                              │
                   └──────────────┬───────────────┘
                                  │
                    Next.js API Routes (/api/*)
                    ├── /api/orders
                    ├── /api/payments/create-preference
                    ├── /api/payments/webhook (MercadoPago)
                    ├── /api/inventory/check
                    └── /api/admin/* (protegidas)
                                  │
                    Next.js Storefront (el proyecto actual)
                    dulceinfancia.co
```

---

## Arquitectura de Referencia (estado actual del código)

```
src/
├── app/
│   ├── layout.tsx                    ← Header + Footer + CartProvider
│   ├── page.tsx                      ← Home — Server Component, 36 líneas
│   ├── not-found.tsx                 ← 404 con branding ✅
│   ├── error.tsx                     ← Error runtime ✅
│   ├── carrito/page.tsx              ← Carrito con AlertDialog
│   ├── checkout-flow/page.tsx        ← 4 pasos — pendiente: POST /api/orders
│   ├── essentials/page.tsx
│   ├── products/
│   │   ├── page.tsx                  ← ⚠️ BUGS (ver brechas arriba)
│   │   └── [id]/page.tsx             ← ⚠️ BUGS (ver brechas arriba)
│   ├── search/page.tsx               ← (PENDIENTE — Bloque 7)
│   ├── favoritos/page.tsx            ← (PENDIENTE — Bloque 6)
│   ├── admin/                        ← (PENDIENTE — Bloque 10)
│   └── category/
│       ├── babies/page.tsx
│       ├── girls/page.tsx
│       ├── boys/page.tsx
│       └── sales/page.tsx
├── components/
│   ├── home/                         ← 5 componentes SOLID ✅
│   ├── cart/                         ← Sistema completo ✅
│   ├── checkout/                     ← 5 pasos ✅
│   ├── layout/                       ← Header, footer, nav ✅
│   ├── product/product-card.tsx      ← Product type, formatPrice, useFavorites ✅
│   └── ui/                           ← shadcn/ui
├── config/
│   ├── store.config.ts               ← brand, nav, rutas, social, contact, homePageContent
│   └── theme.config.ts               ← Paleta OKLCH + tipografía
├── hooks/
│   ├── use-cart.ts                   ← CartContext wrapper ✅
│   ├── use-favorites.ts              ← localStorage por ID ✅
│   ├── use-mobile.tsx
│   └── use-sonner.ts                 ← Toast unificado ✅
└── lib/
    ├── mock-data.ts                  ← TEMPORAL — se reemplaza en Bloque 8
    ├── types.ts                      ← Product, CartItem — ampliar en Bloque 6
    ├── validation.ts                 ← Luhn + shipping + payment ✅
    └── utils.ts                      ← cn(), formatPrice() ✅
```

---

_Para estándares de calidad ver `STANDARDS.md`. Para análisis técnico ver `AUDIT.md`. Para visión de negocio ver `PROJECT.md`._
