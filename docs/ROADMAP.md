# Roadmap — Dulce Infancia Shop

> Actualizado: 2026-06-06 | Score técnico frontend: **20/20** ✅
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

| Problema                         | Detalle                                                                             |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| ~~Productos desde mock-data~~ ✅ | Resuelto: storefront lee de Prisma vía `src/lib/products.ts` + `/api/products`      |
| ~~Checkout no guarda pedido~~ ✅ | Resuelto: `POST /api/orders` transaccional + `/order-success/[id]`                  |
| Imágenes placeholder             | Todos los productos usan imágenes locales o `/placeholder.svg`                      |
| ~~Sin stock real~~ ✅            | Resuelto: `StockBadge` muestra "Agotado" / "Últimas X unidades" desde la DB         |
| ~~Categorías hardcoded~~ ✅      | Resuelto: modelo `Category` + admin CRUD + `/category/[slug]` dinámico (Bloque 9.6) |
| ~~Tema editado no se aplica~~ ✅ | Resuelto: `ThemeStyle` inyecta el tema de la DB (scopeado, validado) — Bloque 9.7   |

### Código con bugs menores

✅ Sin bugs menores pendientes. (`brand-coral` ya no existe en el código; las
categorías son dinámicas desde la DB vía `src/lib/categories.ts` — Bloque 9.6.)

---

## Módulos Existentes

| Módulo               | Ruta                | Estado          | Notas                                                               |
| -------------------- | ------------------- | --------------- | ------------------------------------------------------------------- |
| Home                 | `/`                 | ✅ Sólido       | Hero split 45/55, trust bar marquee, brand promise                  |
| Categoría Bebés      | `/category/babies`  | ✅ Funcional    | 5 productos                                                         |
| Categoría Niñas      | `/category/girls`   | ✅ Funcional    | 4 productos                                                         |
| Categoría Niños      | `/category/boys`    | ✅ Funcional    | 4 productos                                                         |
| Ofertas              | `/category/sales`   | ✅ Funcional    | Filtra `isOnSale: true`                                             |
| Esenciales           | `/essentials`       | ✅ Funcional    | 3 productos                                                         |
| Todos los productos  | `/products`         | ✅ Funcional    | Server Component async desde Prisma                                 |
| Detalle de producto  | `/products/[id]`    | ✅ Funcional    | Prisma + relacionados por props + badge de stock                    |
| Carrito              | `/carrito`          | ✅ Funcional    | AlertDialog, edición de cantidad                                    |
| Checkout             | `/checkout-flow`    | ✅ Funcional    | Guarda el pedido vía `POST /api/orders` → `/order-success/[id]`     |
| 404 (store)          | —                   | ✅ Funcional    | Branding + CTAs                                                     |
| Error (store)        | —                   | ✅ Funcional    | Botón reset + branding                                              |
| Cart Context         | —                   | ✅ Sólido       | localStorage, extensible                                            |
| useFavorites         | —                   | ✅ Funcional    | localStorage, persiste entre navegaciones                           |
| Sistema de tema      | —                   | ✅ Sólido       | OKLCH, Nunito, beige + verde salvia                                 |
| store.config.ts      | —                   | ✅ Centralizado | Brand, nav, rutas, pagos, social, homeContent                       |
| validation.ts        | —                   | ✅ Centralizado | Luhn, shipping, payment                                             |
| products.ts (lib)    | —                   | ✅ Activo       | Repositorio server-only Prisma→Product (reemplazó mock-data.ts)     |
| **Admin Dashboard**  | `/admin`            | ✅ Completo     | Stats, gráficos, accesos rápidos                                    |
| **Admin Login**      | `/admin/login`      | ✅ Funcional    | NextAuth JWT + Credentials                                          |
| **Admin Productos**  | `/admin/productos`  | ✅ CRUD         | Lista, crear, editar, eliminar — Prisma                             |
| **Admin Categorías** | `/admin/categorias` | ✅ CRUD         | Crear/editar/eliminar/ordenar, imagen, SEO — permiso `categories`   |
| **Admin Pedidos**    | `/admin/pedidos`    | ✅ CRUD         | Lista, detalle, cambio de estado                                    |
| **Admin Usuarios**   | `/admin/usuarios`   | ✅ CRUD         | Gestión con asignación de rol                                       |
| **Admin Roles**      | `/admin/roles`      | ✅ CRUD         | Permisos granulares por módulo                                      |
| **Admin Settings**   | `/admin/settings`   | ✅ Modular      | Subpáginas por sección (marca, tema, envíos…) + nav, gate en layout |
| **Admin 404**        | `/admin/*`          | ✅ Profesional  | Página personalizada con branding                                   |
| **Admin Error**      | `/admin/*`          | ✅ Profesional  | Error boundary con retry + navegación                               |

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

### ✅ Bloque 9.5 — Autocompletado inteligente de dirección (checkout)

> **Completado**. País / Departamento / Ciudad como comboboxes buscables y
> encadenados, con auto-detección de país. Instantáneo (dataset server-side +
> caché) y limpio (cmdk, sin dependencias extra).

#### Requisitos UX

- **País**: input tipo combobox (se escribe y filtra resultados). Se **auto-detecta**
  por IP/ubicación y queda preseleccionado, pero **editable** para corroborar/cambiar.
- **Departamento/Estado**: combobox que muestra solo los del país elegido.
- **Ciudad/Municipio**: combobox que muestra solas las del país (y, si aplica, del
  departamento) elegido.
- Cambiar el país **resetea** departamento y ciudad y recarga sus opciones.
- **Código postal: opcional** (quitar obligatoriedad y validación estricta).
- Inputs **custom y buscables** (no `<select>` nativo) para mejor experiencia.

#### Enfoque técnico (implementado)

- **Datos país/estado/ciudad**: dataset `country-state-city` usado **solo en el
  servidor** (`lib/locations.ts`), expuesto vía `/api/locations/*` cacheadas. El
  dataset multi-MB nunca llega al cliente; las ciudades se buscan y limitan en el
  server (rápido incluso en países con miles de ciudades).
- **Auto-detección de país**: `/api/geo` lee el header de geo del edge
  (`x-vercel-ip-country` / `cf-ipcountry`) → cero latencia, sin API key. _Fallback_:
  geo-IP keyless (ipwho.is); si falla devuelve `null` y el cliente usa el default.
  El valor solo **prerellena**, nunca bloquea la edición.
- **UI**: `<Combobox>` propio sobre `cmdk`, **autocontenido** (dropdown posicionado
  - click-outside, sin dependencia de popover — el del repo era un stub), con
    filtrado local (país/estado) o búsqueda async (ciudad) y ARIA combobox/listbox.
- **Integración**: `<AddressSelectors>` reemplaza los inputs en `shipping-form.tsx`;
  guarda nombres legibles en el pedido y rastrea códigos ISO internamente.

#### Tareas

```
[x] Dataset server-only (lib/locations.ts sobre country-state-city) — no llega al cliente
[x] APIs cacheadas: /api/locations/{countries,states,cities} (ciudades buscadas + cap en server)
[x] Componente reutilizable <Combobox> (cmdk) buscable, autocontenido, con estados de carga
[x] command.tsx (wrapper cmdk) reutilizable
[x] Detección de país: /api/geo (header de edge + fallback geo-IP keyless, null seguro)
[x] use-locations hooks con caché de módulo + búsqueda de ciudad con debounce
[x] <AddressSelectors>: País/Departamento/Ciudad encadenados, reset en cambio de país,
    seed por geo (editable), restaura selección al volver atrás
[x] zipCode → opcional (validation.ts + shipping-form)
[x] Mapea nombres legibles al shippingAddress del pedido (códigos ISO solo internos)
[x] Accesibilidad: roles ARIA combobox/listbox, navegación por teclado (cmdk)
```

#### Notas de implementación

- Rendimiento: el dataset (multi-MB) vive **server-side**; el cliente solo recibe
  JSON pequeño y cacheado. Ciudades buscadas + limitadas en el server (sin necesidad
  de virtualización). Búsqueda con debounce; estados/países cacheados en memoria.
- Privacidad: la geo-IP solo prerellena; no se persiste la IP.
- Fallback: si la detección falla (`null`), usa `locale.defaultCountry`.

---

### ✅ Bloque 9.6 — Categorías administrables (dinámicas)

> **Completado**. Las categorías se gestionan 100% desde el admin (crear, editar,
> eliminar, ordenar, activar) — **nada hardcoded**. Storefront, nav, form de
> producto, breadcrumbs y SEO leen las categorías desde la DB. Verificado E2E
> (scripts/verify-categories-admin.mjs, 6/6).

```
[x] Modelo Category (name, slug unique, description, image, order, isActive, SEO)
[x] Product.categoryId → relación FK (migración aditiva: nullable + backfill del
    string legacy "Babies/Girls/Boys/Essentials" a su Category)
[x] Ruta dinámica /category/[slug] (reemplaza babies/girls/boys); ISR +
    generateStaticParams + generateMetadata desde la DB. /essentials → redirect
[x] Admin /admin/categorias — CRUD (nombre, slug auto, descripción, imagen vía
    UploadThing categoryImage, orden, activo, SEO) + permiso "categories"
[x] Nav (header/footer/mobile/404) y form de producto leen categorías de la DB
    (getNavItems / getAdminCategories); navigation hardcoded → specialNavItems
[x] lib/categories.ts (server-only) + /api/admin/categories; productos por
    categoryId/slug; Product.category (dominio) ahora es la relación { name, slug }
[x] "Ofertas" (isOnSale) sigue como vista especial; "Esenciales" es Category normal
[x] Seed crea las categorías y vincula los productos
[x] SEO por categoría desde la DB; sitemap dinámico
[x] Cache etiquetada (`categories`) + ISR; revalidateCategories() al editar en admin
[ ] Subcategorías (parentId) y drag-to-reorder — opcionales, fase futura
```

---

### ✅ Bloque 9.7 — Editor de temas y branding (theming avanzado)

> **Objetivo**: que el cliente personalice el look de la tienda sin tocar código
> — colores con selectores visuales, plantillas, vista previa en vivo, seguro.
> **Estado**: ✅ Fases 1–3 completas (colores + radius + presets + preview +
> contraste AA + inyección segura). Fase 4 (estilos por componente) opcional.

#### Fase 1 — Aplicar el tema de la DB al storefront (cimiento) ✅

```
[x] ThemeStyle (server) lee loadAllSettings().theme e inyecta un <style> scopeado
    a .dulce-theme con --brand-* + tokens shadcn derivados + --radius
[x] Seguridad: lib/theme.ts sanitiza cada valor (isValidColor/isValidRadius — solo
    #hex/oklch()/rgb()/hsl() y longitudes) antes de inyectar; jamás CSS arbitrario
[x] Cacheado (tag "settings") + revalidado al guardar; storefront sigue ISR
[x] Scope correcto: el wrapper .dulce-theme aísla el storefront; el admin (slate)
    no consume tokens de marca, así que no se ve afectado
```

#### Fase 2 — Editor visual (color pickers + vista previa en vivo) ✅

```
[x] lib/color.ts propio (sin dependencias): oklch⇄hex (matemática OKLab verificada),
    parse/format OKLCH, contraste WCAG
[x] ColorRow: swatch + <input type="color"> + campo OKLCH avanzado con validación visual
[x] Panel de vista previa en vivo (banner, card, botones, badge, input) con los mismos
    tokens Tailwind del storefront vía CSS vars inline — refleja cambios ANTES de guardar
[x] Slider de radius; badges de contraste AA (botón base/onBase, texto ink/surface)
```

#### Fase 3 — Plantillas / presets ✅

```
[x] THEME_PRESETS built-in ("Dulce Infancia", "Pastel", "Océano", "Vibrante", "Minimal")
[x] Chips con muestra de colores; aplicar carga el preset en el form (no guarda hasta Guardar)
[x] Preset activo resaltado; todo reversible (Deshacer + presets)
```

#### Fase 4 — Personalización por componente (opcional, futuro)

```
[ ] Esquema extendido: success/danger, estilo de botón (solid/outline), banner,
    toasts (posición, richColors) — mapear a CSS vars + props leídos de settings
[x] Uploader UploadThing para imágenes del home (hecho en 9.8)
[ ] (Mejora) tipografía dinámica (limitada por next/font)
```

#### Consideraciones (cumplidas)

- **Seguridad** ✅: el tema solo produce valores validados inyectados en un `<style>`
  controlado; nunca CSS libre. Gated por permiso `settings`. Conversión propia en `lib/color.ts`.
- **Rendimiento** ✅: theme cacheado con tag; storefront ISR, revalida al guardar.
  Vista previa 100% client.
- **Calidad** ✅: tokens centralizados (`lib/theme.ts`), avisos de contraste AA,
  presets reutilizables, reversible.

---

### ✅ Bloque 9.8 — Config dinámica (aplicar Settings al storefront)

> **Objetivo**: que TODO lo editable desde el admin se aplique de verdad al
> storefront, y eliminar el contenido hardcoded restante.
> **Estado**: ✅ COMPLETO salvo `theme`/`typography` (→ Bloque 9.7). Tablas A y B
> cableadas; el contenido del home es administrable y todo se refleja en vivo.

#### Audit de hardcoded

**A. Settings de la DB aplicados al storefront vía `loadAllSettings` + `SettingsProvider`:**

| Setting (DB key)       | Estado | Cómo se aplica ahora                                                 |
| ---------------------- | ------ | -------------------------------------------------------------------- |
| `brand`                | ✅     | header (layout server), footer, checkout — `useSettings()`           |
| `locale`               | ✅     | `formatPrice(amount, locale)` + `useFormatPrice()`, fechas, país     |
| `shipping`             | ✅     | cart-summary (×2), checkout, product-detail, order-summary           |
| `payment_methods`      | ✅     | `payment-form` vía `useSettings()`                                   |
| `promo_banner`         | ✅     | `PromoBanner` vía `useSettings()`                                    |
| `social` / `contact`   | ✅     | footer vía `useSettings()`                                           |
| brand en `<title>`/SEO | ✅     | `generateMetadata` + `lib/seo.ts` en todas las páginas + root layout |
| `theme` / `typography` | ⏳     | `globals.css` estático → Bloque 9.7                                  |

Infra: `loadAllSettings` cacheado (`unstable_cache`, tag `settings`);
`saveSetting` hace `revalidateTag("settings")` → el admin refresca el storefront.
`SettingsProvider` montado en `(store)/layout.tsx` (server lee, client consume).
SEO: `lib/seo.ts` (`pageMetadata`/`privatePageMetadata`/`customMetadata`/`rootMetadata`)
resuelve el brand vivo; `pageSeo`/`seo` en config son funciones de `brand`.

**B. Contenido del home — ahora administrable** ✅:

- `heroBanners`, `featuredCategories`, `homeFeatures` y todo el copy (`homePageContent`)
  se agrupan en el setting `home_content` y se editan en /admin → Configuración →
  "Contenido del inicio" (banners/categorías/tira con add-remove + preview de imagen).
- El home (`(store)/page.tsx`) lee `loadAllSettings().homeContent`; `pageSeo` ya es
  función de brand (resuelto en A).

**C. Limpiado** ✅: `categoryLabels`, `productCategories`, `categoryHrefFor`,
`essentialsConfig` (config muerto tras categorías dinámicas) — eliminados.

#### Reto técnico (por qué no es solo "leer de la DB")

- **~38 archivos** importan `@/config/store.config` directamente (Server _y_ Client
  Components). Un loader `async` (`loadAllSettings`) solo lo pueden llamar Server
  Components; los Client (`cart-summary`, `mini-cart`, `payment-form`, `hero-section`,
  `trust-bar`, `promo-banner`, `footer`, `mobile-nav`…) importan en module-scope.
- `loadAllSettings()` (en `lib/settings.ts`) **ya hace el merge DB→defaults**, pero
  **no está cacheado** y **nadie lo consume desde el storefront**.
- `saveSetting()` **no revalida** → aunque se cableara, el storefront ISR no se
  actualizaría tras guardar en el admin.

#### Plan por fases

**Fase 1 — Infra de lectura (sin cambiar UI):** ✅

```
[x] Cachear loadAllSettings con unstable_cache, tag "settings" (cold-start friendly)
[x] saveSetting() → revalidateTag("settings") tras el upsert (cerrar el ciclo admin→store)
[x] Frontera definida: store.config queda como defaults + estructura (routes, types,
    pageSeo, home content); brand/locale/shipping/payment/promo/social/contact → DB
```

**Fase 2 — Distribución al árbol de render:** ✅

```
[x] SettingsProvider (client) en (store)/layout.tsx — el layout (server) lee
    loadAllSettings y lo hidrata; los Client leen vía useSettings()/useFormatPrice()
[x] Server Components con precios: order-summary (async) + páginas de pedidos/pago
    leen settings y pasan locale a formatPrice
[x] formatPrice(amount, locale?) retrocompatible (default estático)
```

**Fase 3 — Migración de importers (brand/locale/shipping/payment/promo/social):** ✅

```
[x] Migrados a useSettings()/props: footer, header(layout), cart-summary (cart + checkout),
    mini-cart, order-confirmation, product-detail, product-card, address-selectors,
    checkout-flow, promo-banner, payment-form, order-summary, páginas pedidos/pago
[x] Bug corregido: checkout/cart-summary tenía umbral/costo de envío y "$" hardcodeados
    (50.000/5.000) inconsistentes con la config → ahora usa shipping de settings
[x] Títulos `<title>`/metadata (brand): generateMetadata + lib/seo.ts en todas las
    páginas (home, products, favoritos, search, sales, category/[slug], products/[id],
    cuenta/login/registro/pedidos, order-success, pago, pago-fallido) + root layout
[x] store.config queda como capa de defaults pura (loadAllSettings la consume) — OK
```

> **Fase 3 cerrada**: brand/locale/shipping/payment/promo/social/contact + todos los
> `<title>`/SEO se sirven desde settings.

**Fase 4 — Contenido del home administrable (grupo B):** ✅

```
[x] Setting único `home_content` (heroBanners + featuredCategories + homeFeatures + copy)
    agregado en store.config como default; loadAllSettings lo expone (StoreSettings.homeContent)
[x] Editor en /admin (permiso settings): "Contenido del inicio" con array-editors
    (add/remove + preview de imagen) — primitivos extraídos a primitives.tsx
[x] (store)/page.tsx lee loadAllSettings().homeContent y pasa props a las secciones
[x] Imágenes vía UploadThing (no hardcoded): banners del hero y categorías destacadas
    usan ImageUploadField (endpoint settingsImage, gated por permiso settings) → suben
    al CDN y guardan la URL en la DB; se acabaron los campos de URL manuales
[x] (theme/typography se cubren en Bloque 9.7, no aquí)
```

**Mejoras del editor de inicio (posteriores):** ✅

```
[x] Drag & drop para reordenar banners y categorías destacadas (ver Bloque 9.9)
[x] Selector de íconos buscable para la "Tira de confianza": IconPicker (combobox
    con buscador + grid de previews) sobre TODA la librería lucide (1594 íconos),
    en vez de escribir el nombre a mano. src/lib/lucide-icons.ts es la fuente única
    (registro `icons`, nombres PascalCase) usada por el picker y por el storefront;
    trust-bar ahora resuelve cualquier ícono por nombre (antes mapa fijo de 4 → Package)
[x] Layout del uploader corregido en columnas angostas + labels del dropzone en
    español y compactas; sidebar del admin sticky para que se mantenga visible
```

> **Arquitectura de imágenes**: ninguna imagen del contenido administrable se gestiona
> dentro del repo. El admin sube a UploadThing (CDN) y la DB guarda la URL `*.ufs.sh`.
> Las imágenes demo en `/public` quedan solo como defaults iniciales y pueden borrarse
> cuando el dueño suba las suyas (no se referencian una vez reemplazadas).

> **Bloque 9.8 COMPLETO** salvo `theme`/`typography` (Bloque 9.7). Todo lo editable
> desde /admin se aplica al storefront en vivo (revalidateTag al guardar).

---

### ✅ Bloque 9.9 — Gestión de medios (imágenes) unificada

> **Objetivo**: una experiencia de imágenes consistente, intuitiva y eficiente en
> TODO el admin — subir, reemplazar, reutilizar y limpiar — sin imágenes dentro
> del repo y sin pegar URLs a mano.

#### Estado actual ✅

```
[x] ImageUploadField (UploadThing) reutilizable: preview + botón quitar + dropzone
    con subida automática (mode "auto"); formas portrait/landscape/square por prop
[x] Endpoints por permiso: productImage (products), categoryImage (categories),
    settingsImage (settings) — la subida se aborta si el usuario no tiene permiso
[x] Usado en: productos, categorías y "Contenido del inicio" (hero + cat. destacadas)
[x] next/image remotePatterns ya permite el CDN (*.ufs.sh, utfs.io)
[x] Auditoría completa: ningún campo de imagen del admin es ya input de texto —
    el logo de "Marca" (brand-editor) se migró a ImageUploadField (endpoint settingsImage)
[x] ImageUploadField vive ahora en components/admin/media/ (ubicación compartida);
    imports de productos/categorías/inicio/marca actualizados
[x] Limpieza de huérfanas (src/lib/media-cleanup.ts con UTApi): al reemplazar o
    eliminar una imagen se borra del CDN. Conectado en productos (PUT/PATCH/DELETE),
    categorías (update/delete) y settings (saveSetting hace diff de URLs UploadThing
    del valor previo vs el nuevo → borra las que dejaron de referenciarse: logo,
    banners del hero, categorías destacadas). Best-effort: nunca rompe la mutación;
    solo toca URLs de UploadThing (ignora /placeholder.svg, /public y terceros)
[x] Slots de medios (ImageUploadField prop `slot`: product/category/hero/logo):
    centralizan endpoint, forma del preview, guía de dimensiones y validación.
    Guía visible bajo el dropzone (ej. "Vertical 3:4 · mín. 600×800px") y aviso
    (toast) si la imagen subida es más pequeña que el mínimo recomendado
[x] `sizes` de next/image por slot: storefront ya afinado (hero 55vw, categoría
    25vw, card responsivo, detalle 50vw) + preview del admin ahora también por slot
[x] Barra de progreso real en la subida (onUploadProgress) con porcentaje; límite
    de peso 4MB ya aplicado en el endpoint
[x] Alt text por imagen: columna imageAlt en Product y Category (migración
    add_image_alt) + imageAlt opcional en HeroBanner/FeaturedCategory (JSON).
    Campo en los 4 editores (producto, categoría, banner, categoría destacada);
    el storefront usa `imageAlt || name/title` en product-card, product-detail,
    hero-section y categories-section (antes alt="" en hero/categorías)
[x] Drag & drop para reordenar banners del hero y categorías destacadas en el
    editor del inicio (HTML5 nativo, sin dependencias; hook useSortable + handle
    GripVertical que "arma" la fila al pulsar para no romper la edición de inputs).
    El orden del array es el orden de render en el storefront.
    (Nota: la lista de categorías del admin sigue usando el campo numérico `order`)
[x] /public sin imágenes de contenido: eliminadas las fotos/webp demo y las
    carpetas /vestido-nina y /placeholder/*. Defaults del seed (products-data.ts)
    y de config (heroBanners/featuredCategories) apuntan a /placeholder.svg neutro.
    Se conservan solo placeholders genéricos (placeholder.svg/.jpg, -logo, -user).
    (Nota: filas ya existentes en DB que apuntaban a esas rutas mostrarán el
    placeholder; re-subir desde el admin o re-seed las normaliza)
[x] Biblioteca de medios: lista las imágenes ya subidas al CDN para reutilizarlas
    sin volver a subir. API GET /api/admin/media (protegida; UTApi.listFiles +
    URL pública construida desde el appId del token) + src/lib/media-library.ts;
    modal MediaLibraryModal (grid de miniaturas) abierto desde el botón "Elegir
    de la biblioteca" en el dropzone del ImageUploadField → al elegir, set por onChange
```

> **Bloque 9.9 COMPLETO.** Experiencia de imágenes unificada en todo el admin:
> subir (dropzone + progreso + validación por slot), reutilizar (biblioteca),
> reemplazar/eliminar con limpieza de huérfanas en el CDN, alt text por imagen,
> reordenar por drag & drop, y repo sin imágenes de contenido.
>
> **Mejoras opcionales futuras** (no bloqueantes): biblioteca con buscador/
> paginación y borrado desde el propio modal; alt text también para el logo;
> reorder con drag & drop en la lista de categorías del admin (hoy campo `order`).

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

### ✅ Bloque 13 — Cuenta de cliente y post-compra

> **Completado**. El cliente se registra, inicia sesión, ve su historial de
> pedidos y gestiona su cuenta. Sobre el mismo NextAuth/User/Role del admin.

```
[x] /cuenta/registro — crear cuenta (rol customer idempotente en el primer signup)
[x] /cuenta/login — autenticación (NextAuth Credentials, email normalizado)
[x] /cuenta — panel: nombre, email, cambiar contraseña, cerrar sesión
[x] /cuenta/pedidos — historial con estado + paymentStatus
[x] /cuenta/pedidos/[id] — detalle (verificación de propiedad por userId)
[x] Rol 'customer' sin permisos de admin; middleware protege /cuenta/* y bloquea
    clientes en /admin
[x] Pedidos se enlazan al userId del cliente logueado (createOrder + /api/orders)
[x] Componentes reutilizables <OrderSummary> + <OrderStatusBadge>; order-success
    refactorizado para usarlos
[x] Enlace de cuenta en header (desktop) y menú móvil
[x] Verificado E2E con Playwright (scripts/verify-account.mjs, 7/7)
[x] Guest checkout + "crear cuenta al final" en order-success; el registro reclama
    los pedidos guest con ese email (los enlaza a la nueva cuenta)
[x] Favoritos persistidos en DB (modelo Favorite): FavoritesProvider sincroniza
    localStorage↔DB, merge del set guest al iniciar sesión, toggle reflejado en DB
    (verificado E2E, scripts/verify-favorites.mjs, 2/2)
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

_Para estándares de calidad y arquitectura de datos ver `STANDARDS.md`. Para visión de negocio ver `PROJECT.md`._
