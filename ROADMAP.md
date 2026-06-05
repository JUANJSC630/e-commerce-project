# Roadmap — Dulce Infancia Shop

> Actualizado: 2026-06-05 | Score técnico frontend: **20/20** ✅
> **Objetivo final**: e-commerce 100% administrable — productos, imágenes, inventario y pedidos desde un dashboard sin tocar código.

---

## Estado General

El **frontend y el panel de administración están construidos**. Flujo completo: home → categoría → detalle → carrito → checkout + dashboard admin multi-rol con CRUD de productos, pedidos, usuarios, roles y configuración. **El storefront lee productos reales desde Prisma**, el admin sube imágenes con UploadThing y el **checkout guarda pedidos reales** (transaccional, con descuento de stock y número `DI-2026-001`). Lo que falta para cerrar el flujo: **pagos reales** (MercadoPago) y emails transaccionales.

---

## Decisiones Arquitectónicas — TOMADAS ✅

| Decisión      | Elegida                                   | Razón                                                                   |
| ------------- | ----------------------------------------- | ----------------------------------------------------------------------- |
| Stack backend | **Custom: Next.js + Prisma + PostgreSQL** | Máximo control, todo en un solo proyecto, sin dependencias externas     |
| Base de datos | **Prisma Postgres** (pooled)              | Prisma v7 con driver adapters, `PrismaPg` + `pg.Pool`, SSL verify-full  |
| Autenticación | **NextAuth.js v4** (JWT + Credentials)    | Flexible, integrado con Prisma, roles y permisos custom                 |
| Imágenes      | **UploadThing** (v7, `UPLOADTHING_TOKEN`) | Upload directo desde el admin, CDN propio, router con auth por permisos |
| Panel admin   | **Custom en `/admin`** (Next.js)          | Dashboard completo propio, no Sanity Studio                             |

---

## Brechas Pendientes del Código

### Storefront → Backend (alta prioridad)

| Problema                         | Detalle                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------ |
| ~~Productos desde mock-data~~ ✅ | Resuelto: storefront lee de Prisma vía `src/lib/products.ts` + `/api/products` |
| ~~Checkout no guarda pedido~~ ✅ | Resuelto: `POST /api/orders` transaccional + `/order-success/[id]`             |
| Imágenes placeholder             | Todos los productos usan imágenes locales o `/placeholder.svg`                 |
| ~~Sin stock real~~ ✅            | Resuelto: `StockBadge` muestra "Agotado" / "Últimas X unidades" desde la DB    |

### Código con bugs menores

✅ Sin bugs menores pendientes. (`brand-coral` ya no existe en el código; todas las
páginas leen `categoryLabels` desde `store.config.ts`.)

---

## Módulos Existentes

| Módulo              | Ruta               | Estado          | Notas                                                           |
| ------------------- | ------------------ | --------------- | --------------------------------------------------------------- |
| Home                | `/`                | ✅ Sólido       | Hero split 45/55, trust bar marquee, brand promise              |
| Categoría Bebés     | `/category/babies` | ✅ Funcional    | 5 productos                                                     |
| Categoría Niñas     | `/category/girls`  | ✅ Funcional    | 4 productos                                                     |
| Categoría Niños     | `/category/boys`   | ✅ Funcional    | 4 productos                                                     |
| Ofertas             | `/category/sales`  | ✅ Funcional    | Filtra `isOnSale: true`                                         |
| Esenciales          | `/essentials`      | ✅ Funcional    | 3 productos                                                     |
| Todos los productos | `/products`        | ✅ Funcional    | Server Component async desde Prisma                             |
| Detalle de producto | `/products/[id]`   | ✅ Funcional    | Prisma + relacionados por props + badge de stock                |
| Carrito             | `/carrito`         | ✅ Funcional    | AlertDialog, edición de cantidad                                |
| Checkout            | `/checkout-flow`   | ✅ Funcional    | Guarda el pedido vía `POST /api/orders` → `/order-success/[id]` |
| 404 (store)         | —                  | ✅ Funcional    | Branding + CTAs                                                 |
| Error (store)       | —                  | ✅ Funcional    | Botón reset + branding                                          |
| Cart Context        | —                  | ✅ Sólido       | localStorage, extensible                                        |
| useFavorites        | —                  | ✅ Funcional    | localStorage, persiste entre navegaciones                       |
| Sistema de tema     | —                  | ✅ Sólido       | OKLCH, Nunito, beige + verde salvia                             |
| store.config.ts     | —                  | ✅ Centralizado | Brand, nav, rutas, pagos, social, homeContent                   |
| validation.ts       | —                  | ✅ Centralizado | Luhn, shipping, payment                                         |
| products.ts (lib)   | —                  | ✅ Activo       | Repositorio server-only Prisma→Product (reemplazó mock-data.ts) |
| **Admin Dashboard** | `/admin`           | ✅ Completo     | Stats, gráficos, accesos rápidos                                |
| **Admin Login**     | `/admin/login`     | ✅ Funcional    | NextAuth JWT + Credentials                                      |
| **Admin Productos** | `/admin/productos` | ✅ CRUD         | Lista, crear, editar, eliminar — Prisma                         |
| **Admin Pedidos**   | `/admin/pedidos`   | ✅ CRUD         | Lista, detalle, cambio de estado                                |
| **Admin Usuarios**  | `/admin/usuarios`  | ✅ CRUD         | Gestión con asignación de rol                                   |
| **Admin Roles**     | `/admin/roles`     | ✅ CRUD         | Permisos granulares por módulo                                  |
| **Admin Settings**  | `/admin/settings`  | ✅ CRUD         | 9 secciones editables (brand, theme, shipping, etc.)            |
| **Admin 404**       | `/admin/*`         | ✅ Profesional  | Página personalizada con branding                               |
| **Admin Error**     | `/admin/*`         | ✅ Profesional  | Error boundary con retry + navegación                           |

---

## Plan de Ejecución Completo

### ✅ Bloques 0–5 — Completados

Ver historial al final del documento.

---

### ✅ Bloque 6 — Correcciones de código + SEO base

> **Completado**. Frontend limpio, indexable y con arquitectura SOLID.

```
[x] FIX: products/page.tsx → Server Component, eliminar fake delay
[x] FIX: products/[id]/page.tsx → usar useFavorites(id), leer categoryLabel de config
[x] FIX: todas las páginas de categoría → Server Components con generateMetadata()
[x] FIX: product-detail.tsx extraído como Client Component (DI principle)

[x] SEO: robots.txt en public/
[x] SEO: sitemap.ts en app/
[x] SEO: generateMetadata() en home, /products, /products/[id], todas las categorías

[x] UX: Breadcrumbs en páginas de categoría, detalle y búsqueda (BreadcrumbNav reutilizable)
```

---

### ✅ Bloque 7 — Features de navegación y descubrimiento

> **Completado**. Buscador, filtros, favoritos y banner promocional implementados.

```
[x] Buscador en header + página /search?q= (filtra nombre/categoría/descripción)
[x] Filtros en páginas de categoría (precio, talla, color) — sidebar desktop, drawer mobile
[x] searchProducts() en mock-data.ts — listo para migrar a API
[x] Página /favoritos — lista productos guardados (useFavorites + useAllFavoriteIds)
[x] Banner de promoción colapsable en header (envío gratis, configurable en store.config.ts)
```

---

### ✅ Bloque 8 — Admin Dashboard + Backend con Prisma

> **Completado**. Panel de administración multi-rol con CRUD completo. Se decidió **Custom (Next.js + Prisma + PostgreSQL)** en vez de Sanity + Supabase por control total.

#### Infraestructura

```
[x] Prisma v7 con driver adapters (PrismaPg + pg.Pool)
[x] Prisma Postgres como base de datos (pooled, SSL verify-full)
[x] NextAuth.js v4 (JWT strategy, Credentials provider)
[x] Middleware protege /admin/* → redirige a /admin/login si no autenticado
[x] Route group (store) aísla layout de tienda del admin
[x] prisma.config.ts con datasource URL desde .env
```

#### Modelos Prisma (ya migrados)

```
[x] Role — nombre, slug, permisos granulares (JSON), isSystem
[x] User — email, password (hashed), rol asignado, status (ACTIVE/INACTIVE)
[x] Product — nombre, precio, categoría, stock, imágenes, flags (isOnSale, isNew, isFeatured, isPublished)
[x] Order — cliente, estado (PENDING→CONFIRMED→SHIPPED→DELIVERED→CANCELLED), total, dirección, pago
[x] OrderItem — producto, cantidad, precio, talla, color
[x] Setting — key/value (JSON) para configuración dinámica
```

#### Panel Admin (/admin)

```
[x] /admin — Dashboard: stats de ventas, pedidos, productos, usuarios + gráficos
[x] /admin/login — Login con email/password
[x] /admin/productos — CRUD completo de productos
[x] /admin/pedidos — Lista de pedidos + cambio de estado
[x] /admin/usuarios — CRUD de usuarios con asignación de rol
[x] /admin/roles — CRUD de roles con permisos granulares por módulo
[x] /admin/settings — Editor CRUD de 9 secciones de configuración:
    - Brand (nombre, tagline, logo, favicon)
    - Locale (moneda, idioma, zona horaria)
    - Theme (colores primario/acento/superficie, border-radius)
    - Typography (fuentes display/body, scale)
    - Shipping (costo, umbral gratis, métodos)
    - Payment methods (activar/desactivar métodos)
    - Promo banner (texto, activo/inactivo)
    - Social (Instagram, Facebook, TikTok, Pinterest)
    - Contact (email, teléfono, dirección, horarios)
[x] Sidebar responsive con navegación y permisos
[x] Session provider (NextAuth) en layout admin
```

#### Calidad y UX del Admin

```
[x] Loading skeletons: /admin, /admin/productos, /admin/pedidos, /(store)
[x] Error boundary profesional: /admin/error.tsx (retry + navegación)
[x] 404 profesional: /admin/not-found.tsx (búsqueda fallida + navegación)
[x] Fix hydration: roles-editor accordion (div role="button" en vez de button anidado)
[x] Accesibilidad: Field con htmlFor, Toggle con role="switch" + aria-checked
[x] API robusta: try-catch en request.json(), validación de keys
```

#### Optimización de Performance

```
[x] Middleware scoped solo a /admin/:path* (no catch-all)
[x] next.config: image formats (avif, webp), 30-day cache TTL
[x] experimental.optimizePackageImports: lucide-react, recharts, date-fns
[x] Dynamic import de MiniCart en store layout
[x] SSL: sslmode=verify-full + rejectUnauthorized: true
```

---

### ⏳ Bloque 9 — Conectar storefront al backend real

> **Objetivo**: El storefront deja de leer mock-data.ts y consume productos/pedidos desde Prisma. El checkout guarda pedidos reales.

#### Productos desde Prisma — ✅ Completado

```
[x] Capa de datos server-only src/lib/products.ts (repositorio, mapper Prisma→Product)
[x] Crear API routes: GET /api/products, GET /api/products/[id]
[x] Filtros por categoría, búsqueda, ids — query params (dispatch en /api/products)
[x] Páginas de categoría → Server Components async con Prisma directo
[x] /products y /products/[id] leen de la base de datos
[x] getFeaturedProducts() → Prisma query con isFeatured: true
[x] favoritos (client) → fetch /api/products?ids= con skeleton de carga
[x] sitemap.ts → getAllProductIds() desde Prisma
[x] Seed de 16 productos (prisma/products-data.ts, ids estables, idempotente)
[x] Eliminado src/lib/mock-data.ts
```

#### Pedidos reales — ✅ Completado

```
[x] Schema: Order.orderNumber (unique) + índices createdAt/status (migración aplicada)
[x] src/lib/orders.ts → createOrder() transaccional:
    - Recalcula precios/subtotal/envío/total desde la DB (no confía en el cliente)
    - Descuenta stock con updateMany guard (sin oversell ni bajo concurrencia)
    - Genera DI-2026-001 (reinicio anual) con retry ante colisión única
    - maxWait/timeout ampliados para cold-start del pool de Prisma Postgres
[x] POST /api/orders — re-valida envío en server, OrderError → status HTTP
[x] GET /api/orders/[id]
[x] checkout-flow → handleOrderConfirm async, POST y redirige a /order-success/[id]
[x] OrderConfirmation → espera el request real (eliminado el delay falso de 2s)
[x] /order-success/[id] → Server Component que lee Prisma directo (sin hop HTTP)
[x] Admin: muestra orderNumber en listado y detalle de pedidos
[x] Verificado E2E (totales, descuento de stock, guards out-of-stock/inexistente, numeración)
```

#### Stock en storefront — ✅ Completado

```
[x] Helper src/lib/inventory.ts (isOutOfStock / isLowStock) + config inventory.lowStockThreshold
[x] StockBadge reutilizable: "Agotado" / "Últimas X unidades"
[x] ProductCard → badge de stock + CTA "Agotado" deshabilitado
[x] ProductDetail → badge de stock + bloqueo de "Agregar al carrito"
[x] Verificación de stock al confirmar el pedido (POST /api/orders, transaccional)
```

#### Imágenes reales — ✅ Integración lista (falta cargar contenido)

```
[x] Proveedor: UploadThing (v7, UPLOADTHING_TOKEN)
[x] File router seguro: /api/uploadthing — solo admins con permiso de productos
[x] ImageUploadField (dropzone + preview + quitar) en el form de producto
[x] next.config.ts → remotePatterns para *.ufs.sh y utfs.io
[x] NextSSRPlugin en layout admin (config hidratada en SSR, sin flash)
[x] Estilos vía Tailwind v4 (@import "uploadthing/tw/v4" + @source), no el CSS global
    (el stylesheet pre-construido rompía .hidden y ocultaba el sidebar)
[ ] Migrar productos de placeholder a imágenes reales (contenido, vía /admin/productos)
[ ] (Opcional) Borrar archivo del CDN al reemplazar imagen o eliminar producto (UTApi)
```

#### Fixes de admin (durante Bloque 9)

```
[x] Categorías del form alineadas con las keys del storefront (productCategories en
    store.config.ts) — antes guardaba "niñas"/"ofertas" y el producto quedaba invisible
```

---

### ⏳ Bloque 10 — Pagos reales con MercadoPago

> **Objetivo**: El cliente paga de verdad. El pedido se confirma solo cuando el pago es exitoso.
> **Prerequisito**: Bloque 9 completado (pedidos reales guardados en DB).

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

### ⏳ Bloque 11 — Email transaccional

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

### ⏳ Bloque 12 — Analytics y Marketing

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

### ⏳ Bloque 13 — Cuenta de cliente y post-compra

> **Objetivo**: El cliente puede ver sus pedidos anteriores y gestionar su información.

```
[ ] /cuenta/registro — crear cuenta con email + contraseña
[ ] /cuenta/login — autenticación
[ ] /cuenta — panel: nombre, email, cambiar contraseña
[ ] /cuenta/pedidos — historial de pedidos con estado
[ ] /cuenta/pedidos/[id] — detalle de un pedido específico
[ ] /favoritos — página de productos guardados (useFavorites + persistencia en DB si hay cuenta)

[ ] Autenticación: NextAuth con rol 'customer' (mismo sistema que el admin)
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

### ✅ Bloque 6 — Correcciones de código + SEO base (ver arriba)

### ✅ Bloque 7 — Features de navegación y descubrimiento (ver arriba)

### ✅ Bloque 8 — Admin Dashboard + Backend con Prisma (ver arriba)

---

## Arquitectura Target (estado final)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ADMIN (sin código)                          │
│                                                                     │
│  /admin (Next.js — Custom Dashboard)                                │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Dashboard: ventas, pedidos, stock bajo, gráficos            │    │
│  │ Productos: CRUD completo, imágenes, stock, variantes        │    │
│  │ Pedidos: lista, detalle, cambio de estado, guía de envío    │    │
│  │ Usuarios: CRUD con asignación de roles                      │    │
│  │ Roles: permisos granulares por módulo                       │    │
│  │ Settings: 9 secciones de configuración editables            │    │
│  └─────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                        Prisma ORM (v7, driver adapters)
                                   │
                        PostgreSQL (Prisma Postgres — pooled, SSL)
                        ├── roles, users (auth + permisos)
                        ├── products (catálogo + stock)
                        ├── orders, order_items (pedidos)
                        └── settings (configuración dinámica)
                                   │
                     Next.js API Routes (/api/*)
                     ├── /api/auth/* (NextAuth — JWT)
                     ├── /api/admin/settings (CRUD config)
                     ├── /api/admin/orders (gestión pedidos)
                     ├── /api/admin/products (gestión productos)
                     ├── /api/admin/users (gestión usuarios)
                     ├── /api/admin/roles (gestión roles)
                     ├── /api/orders (crear pedido — PENDIENTE)
                     ├── /api/payments/* (MercadoPago — PENDIENTE)
                     └── /api/products (catálogo público — PENDIENTE)
                                   │
                     Next.js Storefront (/(store) route group)
                     dulceinfancia.co
```

---

## Arquitectura de Referencia (estado actual del código)

```
src/
├── app/
│   ├── (store)/                      ← Route group — layout de tienda (header+footer)
│   │   ├── layout.tsx                ← Header + Footer + CartProvider + MiniCart (dynamic)
│   │   ├── loading.tsx               ← Skeleton de carga
│   │   └── page.tsx                  ← Home — Server Component
│   ├── admin/                        ← Panel de administración ✅
│   │   ├── layout.tsx                ← Sidebar + SessionProvider
│   │   ├── loading.tsx               ← Skeleton admin
│   │   ├── error.tsx                 ← Error boundary profesional
│   │   ├── not-found.tsx             ← 404 profesional
│   │   ├── page.tsx                  ← Dashboard con stats + gráficos
│   │   ├── login/page.tsx            ← Login NextAuth
│   │   ├── productos/               ← CRUD productos
│   │   ├── pedidos/                  ← CRUD pedidos
│   │   ├── usuarios/                 ← CRUD usuarios
│   │   ├── roles/                    ← CRUD roles + permisos
│   │   └── settings/                 ← Editor de 9 secciones de config
│   ├── api/
│   │   ├── auth/[...nextauth]/       ← NextAuth (JWT + Credentials)
│   │   ├── products/                 ← Catálogo público (GET lista + [id])
│   │   ├── orders/                    ← Crear pedido (POST) + confirmación (GET [id])
│   │   ├── uploadthing/              ← File router de imágenes (auth por permisos)
│   │   └── admin/                    ← APIs protegidas (settings, orders, products, users, roles)
│   ├── not-found.tsx                 ← 404 global con branding
│   ├── error.tsx                     ← Error global
│   ├── carrito/page.tsx              ← Carrito con AlertDialog
│   ├── checkout-flow/page.tsx        ← 4 pasos → POST /api/orders → order-success
│   ├── order-success/[id]/page.tsx   ← Confirmación (Server Component, Prisma directo)
│   ├── products/
│   │   ├── page.tsx                  ← Catálogo (async, Prisma vía lib/products)
│   │   └── [id]/page.tsx             ← Detalle producto (Prisma + relacionados)
│   └── category/
│       ├── babies/, girls/, boys/, sales/
├── components/
│   ├── admin/                        ← Componentes del dashboard ✅
│   │   ├── sidebar.tsx               ← Navegación con permisos
│   │   ├── session-provider.tsx      ← NextAuth SessionProvider
│   │   ├── products/                 ← Tabla, formularios de producto
│   │   ├── orders/                   ← Tabla, detalle de pedido
│   │   ├── users/                    ← Tabla, formularios de usuario
│   │   ├── roles/                    ← Editor de roles y permisos
│   │   └── settings/                 ← Editor CRUD de 9 secciones
│   ├── home/                         ← 5 componentes SOLID ✅
│   ├── cart/                         ← Sistema completo ✅
│   ├── checkout/                     ← 5 pasos ✅
│   ├── layout/                       ← Footer, mobile-nav ✅
│   ├── product/product-card.tsx      ← Product type, formatPrice, useFavorites ✅
│   └── ui/                           ← shadcn/ui
├── config/
│   ├── store.config.ts               ← brand, nav, rutas, social, contact, homePageContent
│   └── theme.config.ts               ← Paleta OKLCH + tipografía
├── hooks/
│   ├── use-cart.ts                   ← CartContext wrapper ✅
│   ├── use-favorites.ts             ← localStorage por ID ✅
│   ├── use-mobile.tsx
│   └── use-sonner.ts                ← Toast unificado ✅
├── lib/
│   ├── prisma.ts                    ← Cliente Prisma (PrismaPg + pg.Pool, SSL)
│   ├── auth.ts                      ← authOptions de NextAuth
│   ├── settings.ts                  ← Loader: DB overrides sobre file defaults
│   ├── settings-keys.ts            ← Constantes de keys de settings
│   ├── products.ts                 ← Repositorio server-only Prisma→Product
│   ├── orders.ts                   ← createOrder() transaccional + getOrderForConfirmation
│   ├── inventory.ts                ← isOutOfStock / isLowStock (stock badges)
│   ├── uploadthing.ts              ← Componentes UploadThing tipados
│   ├── types.ts                     ← Product (incluye stock), CartItem
│   ├── validation.ts               ← Luhn + shipping + payment ✅
│   └── utils.ts                     ← cn(), formatPrice() ✅
├── prisma/
│   ├── schema.prisma                ← 6 modelos: Role, User, Product, Order, OrderItem, Setting
│   └── migrations/                  ← Migraciones aplicadas
└── middleware.ts                     ← Protege /admin/* (NextAuth JWT)
```

---

_Para estándares de calidad ver `STANDARDS.md`. Para análisis técnico ver `AUDIT.md`. Para visión de negocio ver `PROJECT.md`._
