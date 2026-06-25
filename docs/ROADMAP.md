# Roadmap — Dulce Infancia Shop

> Actualizado: 2026-06-24 (Bloque 15 — paridad Shopify; Fase A ✅ (A.1/A.2), Fase B ✅, Fase D ✅, **Fase E ✅ completa**; Fase C pendiente. Bloque 14 completo salvo E2E; Bloque 11 emails 4/5) | Score técnico frontend: **20/20** ✅
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

| Problema                          | Detalle                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------ |
| ~~Productos desde mock-data~~ ✅  | Resuelto: storefront lee de Prisma vía `src/lib/products.ts` + `/api/products`       |
| ~~Checkout no guarda pedido~~ ✅  | Resuelto: `POST /api/orders` transaccional + `/order-success/[id]`                   |
| ~~1 sola imagen por producto~~ ✅ | Resuelto: portada + galería `ProductImage[]` (Bloque 15 A.1)                         |
| ~~Sin variantes reales~~ ✅       | Resuelto: `ProductVariant` (stock/precio/SKU/imagen por talla×color) — Bloque 15 A.2 |
| Imágenes placeholder              | Faltan fotos reales de productos (Bloque 15 A.3)                                     |
| ~~Sin stock real~~ ✅             | Resuelto: `StockBadge` muestra "Agotado" / "Últimas X unidades" desde la DB          |
| ~~Categorías hardcoded~~ ✅       | Resuelto: modelo `Category` + admin CRUD + `/category/[slug]` dinámico (Bloque 9.6)  |
| ~~Tema editado no se aplica~~ ✅  | Resuelto: `ThemeStyle` inyecta el tema de la DB (scopeado, validado) — Bloque 9.7    |

### Código con bugs menores

✅ Sin bugs menores pendientes. (`brand-coral` ya no existe en el código; las
categorías son dinámicas desde la DB vía `src/lib/categories.ts` — Bloque 9.6.)

---

## Módulos Existentes

| Módulo               | Ruta                | Estado          | Notas                                                                                         |
| -------------------- | ------------------- | --------------- | --------------------------------------------------------------------------------------------- |
| Home                 | `/`                 | ✅ Sólido       | Hero split 45/55, trust bar marquee, category pills, gender tabs, SEO block, newsletter popup |
| Categoría Bebés      | `/category/babies`  | ✅ Funcional    | 5 productos                                                                                   |
| Categoría Niñas      | `/category/girls`   | ✅ Funcional    | 4 productos                                                                                   |
| Categoría Niños      | `/category/boys`    | ✅ Funcional    | 4 productos                                                                                   |
| Ofertas              | `/category/sales`   | ✅ Funcional    | Filtra `isOnSale: true`                                                                       |
| Esenciales           | `/essentials`       | ✅ Funcional    | 3 productos                                                                                   |
| Todos los productos  | `/products`         | ✅ Funcional    | Server Component async desde Prisma                                                           |
| Detalle de producto  | `/products/[id]`    | ✅ Funcional    | Prisma + relacionados por props + badge de stock                                              |
| Carrito              | `/carrito`          | ✅ Funcional    | AlertDialog, edición de cantidad                                                              |
| Checkout             | `/checkout-flow`    | ✅ Funcional    | Guarda el pedido vía `POST /api/orders` → `/order-success/[id]`                               |
| 404 (store)          | —                   | ✅ Funcional    | Branding + CTAs                                                                               |
| Error (store)        | —                   | ✅ Funcional    | Botón reset + branding                                                                        |
| Cart Context         | —                   | ✅ Sólido       | localStorage, extensible                                                                      |
| useFavorites         | —                   | ✅ Funcional    | localStorage, persiste entre navegaciones                                                     |
| Sistema de tema      | —                   | ✅ Sólido       | OKLCH, Nunito, beige + verde salvia                                                           |
| store.config.ts      | —                   | ✅ Centralizado | Brand, nav, rutas, pagos, social, homeContent                                                 |
| validation.ts        | —                   | ✅ Centralizado | Luhn, shipping, payment                                                                       |
| products.ts (lib)    | —                   | ✅ Activo       | Repositorio server-only Prisma→Product (reemplazó mock-data.ts)                               |
| **Admin Dashboard**  | `/admin`            | ✅ Completo     | Stats, gráficos, accesos rápidos                                                              |
| **Admin Login**      | `/admin/login`      | ✅ Funcional    | NextAuth JWT + Credentials                                                                    |
| **Admin Productos**  | `/admin/productos`  | ✅ CRUD         | Lista, crear, editar, eliminar — Prisma                                                       |
| **Admin Categorías** | `/admin/categorias` | ✅ CRUD         | Crear/editar/eliminar/ordenar, imagen, SEO — permiso `categories`                             |
| **Admin Pedidos**    | `/admin/pedidos`    | ✅ CRUD         | Lista, detalle, cambio de estado                                                              |
| **Admin Usuarios**   | `/admin/usuarios`   | ✅ CRUD         | Gestión con asignación de rol                                                                 |
| **Admin Roles**      | `/admin/roles`      | ✅ CRUD         | Permisos granulares por módulo                                                                |
| **Admin Settings**   | `/admin/settings`   | ✅ Modular      | Subpáginas por sección (marca, tema, envíos…) + nav, gate en layout                           |
| **Admin 404**        | `/admin/*`          | ✅ Profesional  | Página personalizada con branding                                                             |
| **Admin Error**      | `/admin/*`          | ✅ Profesional  | Error boundary con retry + navegación                                                         |

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
[x] Borrar archivo del CDN al reemplazar imagen o eliminar producto (UTApi) — hecho en
    Bloque 9.9 (media-cleanup.ts cableado en products PUT/PATCH/DELETE)
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
[x] Subcategorías (parentId, self-relación) — 2026-06-14. Migración add_category_parent;
    selector de "categoría padre" en el form (con guarda anti-ciclo); getCategoryTree()
    construye el árbol anidado; mega-menú "Categorías" estilo rail + panel de
    subcategorías escalable; mobile-nav con acordeón. getNavItems usa solo nivel superior.
[ ] drag-to-reorder de categorías — opcional, fase futura
```

---

### ✅ Bloque 9.7 — Editor de temas y branding (theming avanzado)

> **Objetivo**: que el cliente personalice el look de la tienda sin tocar código
> — colores con selectores visuales, plantillas, vista previa en vivo, seguro.
> **Estado**: ✅ Fases 1–4 completas (colores + radius + presets + preview +
> contraste AA + inyección segura + **opciones por componente**).

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

#### Fase 4 — Personalización por componente ✅ Completado 2026-06-13

```
[x] Esquema extendido (ThemeOptions en lib/theme.ts): success/danger (colores),
    buttonStyle (solid/outline), bannerStyle (solid/soft), toastPosition,
    toastRichColors. Validado/clampeado en sanitizeThemeOptions; loadAllSettings
    sanitiza el theme completo (todo consumidor recibe valores seguros).
    - success/danger → CSS vars (--brand-success/-danger) + retono de --destructive
      (la badge "Agotado" y la página pago-fallido ya retonan con el danger del tema).
      Registrados como utilidades Tailwind (bg-brand-success/-danger) en globals.css.
    - buttonStyle → data-button-style en el wrapper .dulce-theme + regla CSS
      (.btn-cta outline); marcador btn-cta en los CTAs "Agregar al carrito".
    - bannerStyle → PromoBanner lee theme.bannerStyle (sólido vs suave).
    - toastPosition/toastRichColors → Toaster del root layout leídos de settings.
    Editor (theme-editor.tsx): ColorRows de éxito/peligro, segmented de botón y
    banner, select de posición de toast, toggle de richColors; preview en vivo de
    todo (botón outline, banner suave, chips semánticos). Presets aplican solo la
    paleta y preservan las opciones.
[x] Uploader UploadThing para imágenes del home (hecho en 9.8)
[x] Tipografía dinámica REAL: las fuentes elegidas se aplican en vivo al storefront.
    FontPicker (combobox buscable con preview en la propia fuente, catálogo curado
    de ~65 Google Fonts en src/lib/google-fonts.ts) en /admin → Configuración →
    Tipografía. FontStyle (server, como ThemeStyle) carga la fuente desde Google
    Fonts y sobreescribe --font-display/--font-body en el scope .dulce-theme.
    Se superó la limitación de next/font cargando vía <link> validado (solo
    familias del catálogo, sin CSS arbitrario).
[x] Fix: el <link> de Google Fonts se inyectaba en <body> (no gestionado) y la
    fuente solo aplicaba tras limpiar caché. Ahora usa `precedence` (React 19) →
    se hoistea al <head>, se carga antes del paint y se reemplaza al cambiar el
    href; el <style> de vars lleva key por fuente. Aplica en recarga normal.
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
[x] Cabecera de SectionCard sticky (top-0) en TODAS las secciones de Configuración:
    el botón "Guardar"/"Deshacer" queda siempre accesible en secciones largas sin
    tener que subir hasta el tope
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

### ✅ Bloque 10 — Pagos reales (MercadoPago + arquitectura multi-proveedor)

> **Completado (código)**. El cliente paga de verdad con tarjeta (CardForm,
> tokenización en iframes PCI de MP) o PSE (redirect al banco). El pedido se
> confirma **solo** vía webhook firmado o verificación contra el API de MP.
> Verificado E2E: `yarn verify:payments` (15/15) con un mock del API de MP
> (`MERCADOPAGO_BASE_URL` override) — tarjeta aprobada/rechazada, PSE,
> firma inválida 401, webhook duplicado idempotente y monto manipulado ignorado.
>
> **Implementación real (difiere del plan original donde el código ya era mejor):**
>
> - La UI de pago vive en `/pago/[orderId]` (no en el paso 3 del checkout): ahí
>   el pedido ya existe y el monto sale de la DB — el paso 3 quedó como selector
>   de método (tarjeta/PSE) y se eliminó la captura falsa de tarjeta (y el
>   Luhn/getCardType muerto). El handoff redirect existente (`createCheckout`)
>   se conservó; el mock simulator sigue para dev sin credenciales.
> - Los montos van en pesos (Float, igual que `Order.total` y `transaction_amount`
>   de MP) — no aplica la conversión `/100` del plan (la DB nunca usó centavos).
> - `paymentRef` se renombró a `paymentProviderId` (migración con RENAME).
> - Rechazo síncrono de tarjeta NO guarda providerId: un webhook tardío de un
>   intento muerto jamás cancela un pedido que el cliente está reintentando; el
>   webhook solo cancela si el pago es el intento vigente del pedido.
> - Webhook responde 200 al instante y procesa con `after()` (Next 15).
> - UI del hub de pago pulida (2026-06-10): selector de método tipo tarjetas
>   con estado activo (los tabs genéricos no tenían CSS y eran invisibles),
>   panel de total, badge "Pago seguro", campos h-11 consistentes, selects
>   nativos con chevron propio y franja de confianza al pie.
>
> **Setup manual (2026-06-10):** app creada en el panel de MP (API de Pagos),
> credenciales TEST en `.env.local` (validadas contra el API real: 200, PSE con
> 47 bancos), `MERCADOPAGO_WEBHOOK_SECRET` configurado, cuentas de prueba
> Vendedor/Comprador Colombia creadas. Archivos env reorganizados: `.env` solo
> `DATABASE_URL` (Prisma CLI), `.env.local` todo lo demás (prioridad Next.js).
> **Falta:** prueba sandbox end-to-end con ngrok (tarjetas APRO/FUND + PSE +
> webhook). **Guía paso a paso: [`docs/MERCADOPAGO-SETUP.md`](MERCADOPAGO-SETUP.md)**.
>
> Las especificaciones detalladas de abajo quedan como **referencia de diseño**
> (y para Wompi/Stripe, Bloques 10.5/10.6).
>
> **Referencia oficial**:
>
> - MercadoPago Checkout API: https://www.mercadopago.com.co/developers/es/docs/checkout-api-payments/overview
> - MercadoPago Webhooks: https://www.mercadopago.com.co/developers/es/docs/your-integrations/notifications/webhooks
> - MercadoPago PSE: https://www.mercadopago.com.co/developers/es/docs/checkout-api-payments/integration-configuration/integrate-pse-avanza

---

#### Arquitectura multi-proveedor (DEBE hacerse antes de implementar cualquier proveedor)

El objetivo es que cambiar de proveedor de pago (o activar múltiples) sea cuestión de
variables de entorno, sin tocar lógica de negocio. Cada proveedor implementa la misma
interfaz; el resto del sistema solo habla con la interfaz.

```
src/lib/payments/
├── types.ts            ← IPaymentProvider, PaymentIntent, PaymentResult, WebhookEvent
├── index.ts            ← getPaymentProvider() — factory que lee PAYMENT_PROVIDER del env
├── mercadopago/
│   ├── client.ts       ← inicializa MercadoPago con Access Token
│   ├── provider.ts     ← implementa IPaymentProvider
│   ├── webhook.ts      ← verifica firma HMAC-SHA256, parsea evento
│   └── mapper.ts       ← mapea status MP → PaymentResult.status
├── wompi/              ← estructura idéntica (Bloque 10.5)
└── stripe/             ← estructura idéntica (Bloque 10.6)
    ├── client.ts
    ├── provider.ts
    ├── webhook.ts
    └── mapper.ts
```

**Interfaz `IPaymentProvider` (`src/lib/payments/types.ts`):**

```typescript
export type PaymentStatus = "approved" | "pending" | "rejected" | "error"

export interface CreateCardPaymentInput {
  orderId: string
  orderNumber: string
  amountCents: number // monto en centavos COP
  token: string // token de tarjeta del SDK del proveedor
  installments: number
  paymentMethodId: string
  issuerId?: string
  payer: {
    email: string
    firstName: string
    lastName: string
    identificationType: string // CC, CE, NIT, PAS
    identificationNumber: string
  }
  idempotencyKey: string // UUID v4 generado en checkout, guardado en DB
}

export interface CreatePsePaymentInput {
  orderId: string
  orderNumber: string
  amountCents: number
  callbackUrl: string // URL a la que regresa el usuario tras el banco
  financialInstitution: string // ID del banco (obtenido de /api/payments/banks)
  entityType: "individual" | "association"
  payer: {
    email: string
    firstName: string
    lastName: string
    identificationType: string
    identificationNumber: string
    phone: { areaCode: string; number: string }
    address: { street: string; city: string; state: string; zipCode: string }
  }
  idempotencyKey: string
}

export interface PaymentResult {
  providerId: string // ID del pago en el sistema del proveedor
  status: PaymentStatus
  statusDetail: string // razón de rechazo o estado detallado
  redirectUrl?: string // PSE: URL del banco al que redirigir
  rawResponse: unknown // respuesta completa del proveedor (para auditoría)
}

export interface WebhookEvent {
  type: "payment.approved" | "payment.rejected" | "payment.pending" | "unknown"
  paymentProviderId: string
  orderId?: string
  rawPayload: unknown
}

export interface IPaymentProvider {
  name: string
  createCardPayment(input: CreateCardPaymentInput): Promise<PaymentResult>
  createPsePayment(input: CreatePsePaymentInput): Promise<PaymentResult>
  getPaymentStatus(providerId: string): Promise<PaymentResult>
  parseWebhook(req: Request, rawBody: string): Promise<WebhookEvent>
  getBanks(): Promise<Array<{ id: string; name: string }>>
}
```

**Factory `src/lib/payments/index.ts`:**

```typescript
import { MercadoPagoProvider } from "./mercadopago/provider"
import { WompiProvider } from "./wompi/provider"
import { StripeProvider } from "./stripe/provider"

export function getPaymentProvider(): IPaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER ?? "mercadopago"
  switch (provider) {
    case "mercadopago":
      return new MercadoPagoProvider()
    case "wompi":
      return new WompiProvider()
    case "stripe":
      return new StripeProvider()
    default:
      throw new Error(`Unknown payment provider: ${provider}`)
  }
}
```

---

#### Variables de entorno — configuración por cliente

Todas las variables de pago deben vivir en `.env.local` (nunca en el repo).
El archivo `.env.local.example` documenta todas las necesarias con comentarios.

```bash
# ─── Selector de proveedor activo ───────────────────────────────────────────
# Valores: 'mercadopago' | 'wompi' | 'stripe'
PAYMENT_PROVIDER=mercadopago

# ─── MercadoPago ────────────────────────────────────────────────────────────
# Obtener en: https://www.mercadopago.com.co/developers/panel/app
# Usar credenciales de TEST para sandbox, PROD para producción
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxx          # llave privada (solo servidor)
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-xxxx # llave pública (SDK frontend)
MERCADOPAGO_WEBHOOK_SECRET=xxxx             # clave secreta del webhook (panel → Webhooks)

# ─── Wompi (Bloque 10.5 — completar cuando se active) ───────────────────────
# Obtener en: https://comercios.wompi.co
# Sandbox: claves que empiezan con pub_test_ / prv_test_
# Producción: claves que empiezan con pub_prod_ / prv_prod_
WOMPI_PUBLIC_KEY=pub_test_xxxx              # llave pública (SDK frontend / widget)
WOMPI_PRIVATE_KEY=prv_test_xxxx            # llave privada (solo servidor)
WOMPI_EVENTS_SECRET=xxxx                   # secreto de integridad de eventos webhook
# WOMPI_BASE_URL se infiere del prefijo de las llaves (test vs prod) en el client.ts

# ─── Stripe (Bloque 10.6 — para clientes internacionales o fuera de Colombia) ─
# Obtener en: https://dashboard.stripe.com/apikeys
# Sandbox: llaves que empiezan con sk_test_ / pk_test_
# Producción: llaves que empiezan con sk_live_ / pk_live_
STRIPE_SECRET_KEY=sk_test_xxxx              # llave privada (solo servidor)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx # llave pública (Stripe.js frontend)
STRIPE_WEBHOOK_SECRET=whsec_xxxx           # secreto del webhook (stripe listen → obtener)

# ─── URLs de retorno (mismo para todos los proveedores) ─────────────────────
NEXT_PUBLIC_APP_URL=https://tudominio.co    # usado para construir callback/return URLs
```

**Cómo cambiar de proveedor al replicar para otro cliente:**

1. Copiar `.env.local.example` → `.env.local`
2. Cambiar `PAYMENT_PROVIDER=wompi` | `stripe` | `mercadopago`
3. Llenar solo las claves del proveedor elegido
4. El resto del código no cambia

---

#### Cambios en el schema de Prisma

```prisma
model Order {
  // ... campos existentes ...

  // ── Pagos ────────────────────────────────────────────────────────────
  paymentProvider   String?   // 'mercadopago' | 'wompi' | 'stripe'
  paymentProviderId String?   // ID del pago en el sistema del proveedor
  paymentMethod     String?   // 'card' | 'pse' | 'nequi' | 'bancolombia'
  paymentStatus     PaymentStatus @default(PENDING)
  idempotencyKey    String?   @unique // UUID v4 generado en checkout

  // ── PSE (redirect async) ─────────────────────────────────────────────
  pseRedirectUrl    String?   // URL del banco (MP: external_resource_url)
}

enum PaymentStatus {
  PENDING     // pedido creado, pago no iniciado o en curso
  PROCESSING  // cliente fue redirigido al banco (PSE)
  PAID        // pago confirmado por webhook o polling
  FAILED      // pago rechazado
  REFUNDED    // devolución procesada
}
```

**Migración nueva:** `add_payment_fields_to_orders`

- Agregar: `paymentProvider`, `paymentProviderId`, `paymentMethod`, `paymentStatus`
  (enum con default PENDING), `idempotencyKey` (unique nullable), `pseRedirectUrl`
- Migración aditiva — no rompe el checkout existente

---

#### Máquina de estados del pedido (Order state machine)

```
PENDING ──[cliente inicia pago]──► PROCESSING (PSE) o ──► se queda PENDING (tarjeta)
   │                                     │
   │                                     │ webhook: transfer completado
   ▼                                     ▼
PENDING ──[webhook: approved]──────────► PAID ──[admin envía]──► SHIPPED ──► DELIVERED
   │
   └──[webhook: rejected]──────────────► FAILED
```

**Reglas:**

- El pedido se crea siempre en `PENDING` (createOrder existente no cambia)
- `PAID` solo lo escribe el webhook handler — nunca el frontend
- Si el webhook llega duplicado, verificar que no esté ya en `PAID` antes de reprocessar
- Si `idempotencyKey` ya existe en DB con otro pedido, retornar 409 al frontend

---

#### Fase 10-A: MercadoPago — Tarjetas (CardForm)

**Principio clave**: La tarjeta nunca toca el servidor — MercadoPago.js corre en el
cliente, tokeniza la tarjeta, y el frontend envía solo el token al backend.

```
[ ] Instalar SDK: npm install @mercadopago/sdk-js
[ ] Crear src/lib/payments/mercadopago/client.ts
    - Inicializa con MERCADOPAGO_ACCESS_TOKEN (server-side, usando 'mercadopago' npm pkg)
    - npm install mercadopago (SDK de Node.js oficial)
    - new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! })

[ ] Implementar MercadoPagoProvider.createCardPayment():
    - POST https://api.mercadopago.com/v1/payments
    - Header X-Idempotency-Key: {idempotencyKey} (OBLIGATORIO para evitar doble cobro)
    - Body:
      {
        transaction_amount: amountCents / 100,  // MP trabaja en pesos, no centavos
        token,                                   // token del CardForm
        description: `Pedido ${orderNumber}`,
        installments,
        payment_method_id,
        issuer_id,
        payer: {
          email,
          first_name,
          last_name,
          identification: { type, number }
        },
        external_reference: orderId,             // para cruzar con webhook
        notification_url: `${APP_URL}/api/payments/webhook/mercadopago`
      }
    - Mapear respuesta: status "approved"→PAID, "pending"→PENDING, "rejected"→FAILED
    - Guardar en Order: paymentProviderId, paymentStatus, paymentMethod='card'

[ ] Implementar CardForm en payment-form.tsx (reemplaza el form manual actual):
    - Cargar @mercadopago/sdk-js dinámicamente (import() en useEffect, no en build)
    - Inicializar: new MercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!)
    - Usar mp.cardForm() con callbacks: onFormMounted, onSubmit, onError
    - onSubmit: llamar cardForm.getCardFormData() → obtiene token, paymentMethodId,
      issuerId, installments — enviar a POST /api/payments/initiate
    - Nunca loguear ni enviar datos de tarjeta raw — solo el token
    - Manejar errores de CardForm: mostrar mensajes amigables (fondos insuficientes,
      tarjeta rechazada, etc.) sin exponer status_detail raw al cliente

[ ] Crear POST /api/payments/initiate (server action o route handler):
    - Recibir: orderId, token, installments, paymentMethodId, issuerId, payerInfo
    - Validar que el orderId pertenece al usuario en sesión y está en PENDING
    - Generar idempotencyKey = randomUUID() y guardarlo en Order antes de llamar al proveedor
    - Llamar getPaymentProvider().createCardPayment(...)
    - Si status === PAID: retornar { success: true, redirectTo: '/order-success/[id]' }
    - Si status === PENDING: retornar { success: true, redirectTo: '/order-success/[id]' }
      (el webhook confirmará después)
    - Si status === FAILED: retornar { success: false, error: mensajeAmigable }
    - Nunca retornar status_detail de MP al cliente (puede exponer razones de fraude)
```

---

#### Fase 10-B: MercadoPago — PSE

```
[ ] Agregar endpoint GET /api/payments/banks?provider=mercadopago
    - Llama GET https://api.mercadopago.com/v1/payment_methods con Access Token
    - Filtra payment_method_id === 'pse', extrae financial_institutions[]
    - Cachear la respuesta (revalidate: 3600) — la lista de bancos no cambia frecuente
    - Retorna [{ id: "1009", name: "Banco de Bogotá" }, ...]

[ ] Agregar tab/opción PSE en payment-form.tsx:
    - Dropdown de bancos (cargado desde /api/payments/banks)
    - Selector de tipo de persona: natural (CC/CE/PAS) o jurídica (NIT)
    - Formulario completo de datos del pagador (requerido por MP):
      firstName, lastName, identificationType, identificationNumber,
      email, phone (areaCode 3 dígitos + number máx 7 dígitos),
      address (street, city, state, zipCode 5 dígitos)

[ ] Implementar MercadoPagoProvider.createPsePayment():
    - POST https://api.mercadopago.com/v1/payments
    - Body:
      {
        transaction_amount: amountCents / 100,
        payment_method_id: "pse",
        payer: {
          entity_type: entityType === 'individual' ? 'individual' : 'association',
          identification: { type, number },
          first_name, last_name, email,
          phone: { area_code: areaCode, number: phoneNumber },
          address: { street_name, city, federal_unit, zip_code }
        },
        transaction_details: { financial_institution: bankId },
        callback_url: `${APP_URL}/api/payments/pse-return?orderId=${orderId}`,
        notification_url: `${APP_URL}/api/payments/webhook/mercadopago`,
        external_reference: orderId
      }
    - Respuesta siempre: status "pending", status_detail "pending_waiting_transfer"
    - Retornar external_resource_url (URL del banco donde el usuario completa el pago)
    - Guardar en Order: paymentStatus=PROCESSING, pseRedirectUrl, paymentProviderId

[ ] En /api/payments/initiate: detectar método PSE, llamar createPsePayment(),
    retornar { success: true, redirectUrl: external_resource_url } — el frontend
    redirige al banco con window.location.href = redirectUrl

[ ] Crear GET /api/payments/pse-return:
    - MP redirige aquí después del banco con ?collection_status=approved|rejected|pending
    - Buscar el Order por orderId del query param
    - Consultar estado real: getPaymentProvider().getPaymentStatus(paymentProviderId)
    - Actualizar Order según resultado
    - Redirigir a /order-success/[id] o /payment-failed/[id]
    - IMPORTANTE: no confiar solo en collection_status del query param — siempre
      verificar con el API de MP (puede manipularse en la URL)
```

---

#### Fase 10-C: Webhook handler — MercadoPago

```
[ ] Crear POST /api/payments/webhook/mercadopago (route handler, no server action):
    export const runtime = 'edge'; // opcional, para latencia mínima

    Algoritmo completo:
    1. Leer body raw como string (ANTES de parsear JSON — necesario para HMAC)
    2. Verificar firma HMAC-SHA256:
       a. Extraer header x-signature: "ts=1704106600&v1=abc123..."
       b. Extraer header x-request-id
       c. Extraer data.id del body (el ID del pago)
       d. Construir template: "id:{data.id};request-id:{x-request-id};ts:{ts};"
       e. HMAC = createHmac('sha256', MERCADOPAGO_WEBHOOK_SECRET).update(template).digest('hex')
       f. Si HMAC !== v1 del header → retornar 401, loguear el intento
    3. Retornar 200 INMEDIATAMENTE (MP requiere < 22s o reintenta)
    4. Procesar en background (setImmediate / sin await en la respuesta):
       a. Si type !== 'payment' → ignorar (puede ser merchant_order u otro)
       b. Consultar estado real: GET https://api.mercadopago.com/v1/payments/{data.id}
          (el webhook solo trae el ID — el estado real viene del GET)
       c. Buscar Order por external_reference (= orderId guardado al crear el pago)
       d. Si Order no existe o ya está en PAID → ignorar (idempotencia)
       e. Según payment.status:
          - "approved" → Order.paymentStatus=PAID, Order.status=CONFIRMED
          - "rejected" → Order.paymentStatus=FAILED
          - "pending"  → Order.paymentStatus=PENDING (sin cambio visible)
       f. Disparar email transaccional según evento (Bloque 11)
       g. Loguear resultado en tabla PaymentLog (ver esquema abajo)

[ ] Tabla de auditoría PaymentLog (nueva migración):
    model PaymentLog {
      id          String   @id @default(cuid())
      orderId     String
      provider    String                          // 'mercadopago' | 'wompi' | 'stripe'
      event       String                          // 'webhook.payment.approved', etc.
      providerId  String?                         // ID del pago en el proveedor
      status      String                          // status recibido
      rawPayload  Json                            // payload completo para auditoría
      createdAt   DateTime @default(now())
      order       Order    @relation(fields: [orderId], references: [id])
    }
```

---

#### Fase 10-D: Seguridad y resiliencia

```
[ ] Protección contra doble cobro:
    - idempotencyKey guardado en Order ANTES de llamar al proveedor
    - Si la llamada al proveedor falla (timeout/5xx), el idempotencyKey ya está en DB
    - Al reintentar: enviar el mismo idempotencyKey → MP devuelve el mismo pago
    - Columna idempotencyKey es @unique en DB → cualquier duplicado lanza error 409

[ ] Rate limiting en /api/payments/initiate:
    - Máximo 5 intentos por orderId (evitar brute-force de CVV)
    - Usar tabla PaymentAttempt o campo attemptCount en Order

[ ] Validación de monto en el servidor:
    - NUNCA confiar en el monto que llega del frontend
    - Recalcular total desde DB (items × precio + envío) antes de llamar al proveedor
    - Si el monto del frontend ≠ monto calculado → rechazar con 400

[ ] Webhook: evitar SSRF en la consulta al proveedor
    - Usar solo el ID del pago del webhook payload para construir la URL
    - No usar ninguna URL que venga del payload

[ ] Variables de entorno: nunca usar claves de producción en desarrollo
    - MERCADOPAGO_ACCESS_TOKEN debe empezar con "TEST-" en desarrollo
    - Validar esto en client.ts al inicializar (process.env.NODE_ENV check)
```

---

#### Fase 10-E: UI del checkout actualizada

```
[ ] Reemplazar payment-form.tsx actual:
    - Paso 4 del checkout (actual: inputs manuales de tarjeta) →
      TabSelector: "Tarjeta de crédito/débito" | "PSE"
    - Tab Tarjeta: CardForm de MercadoPago.js (iframes seguros, PCI-compliant)
      * El CardForm renderiza iframes nativos — NO se puede estilizar con Tailwind directo
      * Usar las CSS variables del CardForm API para adaptar colores al tema
      * Mostrar selector de cuotas (installments) si el monto > umbral configurable
    - Tab PSE: formulario propio con dropdown de bancos + datos del pagador
    - Estado de carga durante el pago: overlay + spinner (evitar doble submit)
    - Resultado en línea: mensaje de error friendly sin exponer status_detail

[ ] Página /payment-failed/[id] (nueva):
    - Mostrar razón amigable del rechazo (traducción de status_detail)
    - CTA: "Intentar con otra tarjeta" → vuelve al checkout con el mismo orderId
    - CTA: "Pagar por PSE" → switch al tab PSE
    - El pedido sigue en PENDING — el cliente puede reintentar

[ ] /order-success/[id] — actualizar para mostrar paymentStatus:
    - Si PAID: "¡Pago confirmado! Tu pedido está siendo procesado"
    - Si PENDING: "Tu pedido está pendiente de confirmación de pago.
      Te notificaremos por email cuando se confirme." (caso PSE)
    - Si PROCESSING: "Completando pago en tu banco..."
```

---

#### Fase 10-F: Testing

```
[ ] Tarjetas de prueba MercadoPago (ambiente TEST):
    Mastercard crédito: 5254 1336 7440 3564 | CVV: 123 | Venc: 11/30
    Visa crédito:       4013 5406 8274 6260 | CVV: 123 | Venc: 11/30
    Visa débito:        4915 1120 5524 6507 | CVV: 123 | Venc: 11/30

    Controlar resultado cambiando el NOMBRE del titular:
    APRO = Aprobado      | FUND = Fondos insuficientes | SECU = CVV inválido
    OTHE = Error general | EXPI = Tarjeta vencida       | CALL = Llamar al banco
    CONT = Pendiente     | LOCK = Tarjeta bloqueada     | DUPL = Pago duplicado

[ ] Verificar webhook localmente:
    - Usar ngrok o similar para exponer localhost
    - Configurar la URL de ngrok en el panel de MP como URL de prueba
    - Simular webhook con: curl -X POST http://localhost:3000/api/payments/webhook/mercadopago
      -H "x-signature: ts=1704106600&v1={hash}" -H "x-request-id: {uuid}" -d '{...}'

[ ] E2E mínimo (scripts/verify-payments.mjs):
    [ ] Flujo tarjeta aprobada: crear pedido → pagar → verificar Order.paymentStatus=PAID
    [ ] Flujo tarjeta rechazada: pagar con FUND → verificar Order.paymentStatus=FAILED,
        Order.status sigue PENDING
    [ ] Flujo PSE: crear pago → verificar redirectUrl devuelta → simular webhook approved
    [ ] Webhook duplicado: enviar mismo webhook dos veces → verificar idempotencia (sin error)
    [ ] Monto manipulado: enviar monto diferente desde frontend → verificar rechazo 400
```

---

### ✅ Bloque 9.10 — Media Manager (gestor completo de archivos del CDN)

> **✅ Completado 2026-06-13** (ver checklist al final de la sección).
>
> **Robustez añadida (cierre de gaps, 2026-06-13):**
>
> - `loading.tsx` con skeleton para el primer scan (cache frío) — ya no bloquea sin feedback.
> - `error.tsx` con estado degradado + reintento si el scan falla (p. ej. falta
>   `UPLOADTHING_TOKEN`), sin reventar al error boundary global del admin.
> - **Badge de huérfanos en el sidebar**: ahora sí, pero **sin la regresión** que se
>   evitaba: el sidebar consulta `GET /api/admin/media?stats=1`, que lee el conteo del
>   scan **cacheado** (no dispara un scan por carga) de forma asíncrona/no bloqueante.
>
> Diferencia que se mantiene a propósito: el filtrado/paginación del gestor es
> client-side sobre el `ScanResult` completo (la página lee `scanMediaUsage()` directo,
> sin hop HTTP). A esta escala es más ágil que paginar server-side por HTTP.

> **Objetivo**: una página dedicada en el admin (`/admin/media`) que muestra TODOS
> los archivos subidos al CDN de UploadThing, indica cuáles están siendo usados y
> dónde, detecta huérfanos, y permite limpiarlos individualmente o en lote — todo
> integrado con las entidades reales de la DB (productos, categorías, settings).
>
> **Por qué es necesario**: hoy el admin puede subir imágenes desde cualquier editor
> pero nunca tiene una vista global. Archivos de prueba, versiones antiguas de logos,
> banners reemplazados y fotos de categorías eliminadas acumulan espacio en el CDN
> sin saberlo. El limpiador automático (`media-cleanup.ts`) borra huérfanos al
> reemplazar/eliminar entidades, pero no detecta los que quedaron de antes.

---

#### Lo que la UTApi de UploadThing permite (confirmado en la documentación oficial)

| Método UTApi                          | Qué hace                                     | Parámetros clave                                      |
| ------------------------------------- | -------------------------------------------- | ----------------------------------------------------- |
| `listFiles({ limit, offset })`        | Lista paginada de todos los archivos del app | `limit` (máx 500, default 500), `offset` para paginar |
| `deleteFiles(keys[])`                 | Elimina archivos por key; soporta batch      | Array de fileKeys; máx 25 simultáneos                 |
| `renameFiles([{ fileKey, newName }])` | Renombra uno o varios archivos               | Array de objetos fileKey + newName                    |
| `uploadFilesFromUrl(urls[])`          | Sube desde URL externa al CDN                | Para migraciones futuras                              |
| `updateACL(keys, { acl })`            | Cambia acceso a público o privado            | `"public-read"` o `"private"`                         |

**Campos disponibles por archivo** (response de `listFiles`):

```typescript
{
  key: string // ej: "2e0fdb64-9957-4262-8e45-f372ba903ac8_imagen.jpg"
  name: string // nombre original del archivo
  size: number // bytes
  uploadedAt: number // timestamp unix
  status: "Uploaded" | "Uploading" | "Failed" | "Deletion Pending"
}
```

**URL pública** (determinística, ya calculada en `media-library.ts`):

```
https://{appId}.ufs.sh/f/{key}
```

El `appId` se extrae del `UPLOADTHING_TOKEN` (base64 JSON).

**Límites relevantes**:

- No hay método `getUsageInfo()` para cuota de almacenamiento total
- No hay metadata custom por archivo (no podemos guardar en UT a qué entidad pertenece)
- Borrado concurrente: máx 25 archivos por llamada — batching necesario para lotes grandes

---

#### Campos de imagen en la DB que deben escanearse

El scanner de uso debe cruzar TODAS estas fuentes para saber si un archivo está "en uso":

| Tabla / Fuente                 | Campo                              | Tipo                      | Notas                               |
| ------------------------------ | ---------------------------------- | ------------------------- | ----------------------------------- |
| `Product`                      | `image`                            | `String`                  | URL directa o `/placeholder.svg`    |
| `Category`                     | `image`                            | `String?`                 | URL directa o null                  |
| `User`                         | `image`                            | `String?`                 | Generalmente null o avatar externo  |
| `Setting` (key `brand`)        | `value.logoUrl`                    | `String?` dentro de JSON  | Logo de la tienda                   |
| `Setting` (key `home_content`) | `value.heroBanners[].image`        | `String[]` dentro de JSON | Banners del hero                    |
| `Setting` (key `home_content`) | `value.featuredCategories[].image` | `String[]` dentro de JSON | Categorías destacadas               |
| `Setting` (cualquier otra)     | `value`                            | `Json` recursivo          | Cualquier campo futuro con imágenes |

La función `collectUploadThingUrls(value)` de `media-cleanup.ts` ya hace el
escaneo recursivo de JSON — **reutilizar sin modificar**.

---

#### Arquitectura del módulo

```
src/
├── lib/
│   └── media-manager.ts          ← nuevo: scan de uso + build del índice de referencias
│
├── app/api/admin/
│   └── media/
│       ├── route.ts              ← extender: añadir DELETE + paginación + ?scan=true
│       └── scan/route.ts         ← nuevo: GET — devuelve el informe de uso completo
│
├── app/admin/
│   └── media/
│       └── page.tsx              ← nuevo: página completa del gestor
│
└── components/admin/media/
    ├── image-upload-field.tsx    ← existente, sin cambios
    ├── media-library-modal.tsx   ← existente, sin cambios
    └── media-manager-page.tsx    ← nuevo: Client Component principal del gestor
```

---

#### Fase 1 — Scanner de uso (`src/lib/media-manager.ts`)

```typescript
// Tipos de retorno del scanner
export interface FileReference {
  entity: "product" | "category" | "setting" | "user"
  entityId: string
  entityName: string // nombre legible: "Vestido Rosa" / "Bebés" / "brand.logoUrl"
  field: string // "image" / "value.heroBanners[0].image"
}

export interface ScannedFile {
  key: string
  url: string
  name: string
  size: number // bytes
  uploadedAt: number // timestamp
  usedBy: FileReference[] // vacío = huérfano
  isOrphan: boolean // shortcut: usedBy.length === 0
}

export interface ScanResult {
  files: ScannedFile[]
  totalFiles: number
  totalSize: number // bytes sumados
  orphanCount: number
  orphanSize: number // bytes que se pueden liberar
  scannedAt: number // timestamp del scan
}
```

**Algoritmo del scan** (en `media-manager.ts`):

```
1. listFiles() de UTApi — paginar con limit=500 hasta hasMore=false
   → construir Map<key, FileInfo>

2. Escanear la DB en paralelo (Promise.all):
   a. prisma.product.findMany({ select: { id, name, image, imageAlt } })
   b. prisma.category.findMany({ select: { id, name, image } })
   c. prisma.user.findMany({ select: { id, name, image } })
   d. prisma.setting.findMany({ select: { key, value } })

3. Por cada URL encontrada en la DB:
   - Extraer key con uploadThingKeyFromUrl() (ya existe en media-cleanup.ts)
   - Si el key está en el Map del paso 1: agregar la referencia a FileReference[]

4. Construir ScannedFile[] cruzando los resultados:
   - archivos con referencias → isOrphan: false
   - archivos sin referencias → isOrphan: true

5. Ordenar: huérfanos primero, luego por fecha de subida desc
```

**Caché del scan**: el scan puede tardar 1-3 segundos (2 llamadas: UTApi + DB).
Cachear el resultado 5 minutos con `unstable_cache` y un tag `"media-scan"`.
La acción de borrar un archivo debe llamar `revalidateTag("media-scan")`.

---

#### Fase 2 — API routes

**`GET /api/admin/media`** (extender el existente):

```
Parámetros:
  ?page=1         → paginación en el cliente (25 por página)
  ?filter=all|used|orphan  → filtro de estado

Respuesta actual:
  { items: MediaItem[] }

Respuesta nueva:
  {
    items: ScannedFile[],
    total: number,
    orphanCount: number,
    orphanSize: number,
    page: number,
    hasMore: boolean
  }
```

**`DELETE /api/admin/media`** (nuevo):

```typescript
// Body: { keys: string[] }
// Validar: máximo 100 keys por request (protección contra abusos)
// Proceso:
//   1. Verificar que ninguna key está siendo usada en la DB (re-verificar antes de borrar)
//   2. Batching: deletar en chunks de 25 (límite UTApi)
//   3. revalidateTag("media-scan")
//   4. Retornar: { deleted: number, failed: string[] }
// Permisos: misma lógica que el GET actual (products|categories|settings create/update)
```

**`GET /api/admin/media/scan`** (nuevo):

```
Dispara un scan fresco (ignora caché) y retorna ScanResult completo.
Solo accesible por admins con permiso settings.
Útil para el botón "Actualizar" de la UI.
```

---

#### Fase 3 — UI: página `/admin/media`

**Layout general**:

```
┌─────────────────────────────────────────────────────┐
│  Gestor de Medios                    [Actualizar ↻]  │
│                                                      │
│  📦 47 archivos · 12.4 MB · ⚠️ 8 huérfanos (2.1 MB) │
│                                                      │
│  [Todos (47)] [En uso (39)] [Huérfanos (8)]         │
│                                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │ img  │ │ img  │ │ img  │ │ img  │ │ img  │      │
│  │      │ │      │ │ ⚠️    │ │      │ │ ⚠️    │      │
│  │ 245KB│ │ 180KB│ │ 312KB│ │ 95KB │ │ 428KB│      │
│  │ ✅x3 │ │ ✅x1 │ │ Huér │ │ ✅x2 │ │ Huér │      │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘      │
│                                                      │
│  [☐ Seleccionar todo]  [🗑 Eliminar seleccionados]   │
│                                                      │
│  ← Anterior  Página 1 de 2  Siguiente →             │
└─────────────────────────────────────────────────────┘
```

**Tarjeta de archivo (detalle al hover/click)**:

```
┌────────────────────────────────┐
│  [✓]  [imagen thumbnail]       │
│                                │
│  banner-hero-verano.jpg        │
│  312 KB · Hace 3 días          │
│                                │
│  ⚠️ Sin referencias            │
│     (o)                        │
│  ✅ Usado en:                  │
│    · Producto "Vestido Rosa"   │
│    · Setting home_content[0]   │
│                                │
│  [🗑 Eliminar]                 │
└────────────────────────────────┘
```

**Acciones masivas**:

- Checkbox por tarjeta + "Seleccionar todo los huérfanos"
- Botón "Eliminar seleccionados (N)" con AlertDialog de confirmación
- "Eliminar todos los huérfanos" — acción en lote con confirmación explícita
  mostrando el espacio que se liberará: "¿Eliminar 8 archivos y liberar 2.1 MB?"

**Flujo de eliminación segura**:

```
1. Admin selecciona archivos y hace click en "Eliminar"
2. AlertDialog: "¿Eliminar N archivos? Esta acción no se puede deshacer."
   Si hay archivos EN USO en la selección: warning extra
   "⚠️ X archivos seleccionados están siendo usados. Eliminarlos romperá
   las imágenes donde aparecen."
3. Confirmación → DELETE /api/admin/media con { keys: [...] }
4. API re-verifica uso antes de borrar (protección de último momento)
5. Resultado: toast "N archivos eliminados, X MB liberados"
6. Grid se actualiza sin reload completo
```

---

#### Fase 4 — Integración con el sistema existente

```
[x] (ya existe) media-cleanup.ts → borra huérfanos al reemplazar imágenes en entities
[ ] Agregar revalidateTag("media-scan") en media-cleanup.ts cuando borra
[ ] Agregar link "Gestor de medios →" en la MediaLibraryModal (acceso rápido desde editores)
[ ] Sidebar del admin → agregar entrada "Medios" bajo Settings o como sección propia
    (solo visible para users con settings o products read+)
[ ] Mostrar badge de "X huérfanos" en el link del sidebar si orphanCount > 0
    (leído del caché del scan, no bloquea el render del sidebar)
```

---

#### Consideraciones técnicas

**Consistencia eventual**: un archivo puede aparecer como "usado" en el scan
pero ya no estarlo si el admin eliminó la entidad entre el scan y el render.
La re-verificación en el DELETE handler es la guardia final.

**Performance**: el scan hace `listFiles` (HTTP a UTApi) + 4 queries de Prisma en paralelo.
En una tienda con 500 archivos y 200 productos + 20 categorías + 10 settings, el scan
tarda ~1-2 segundos en cold y es instantáneo desde caché. El TTL de 5 min es adecuado.

**Paginación en el cliente**: el scan trae todos los archivos de una vez (para poder
calcular el total de huérfanos y el tamaño). La paginación de 25 por página es UI-only.

**Sin rename en la UI inicial**: `renameFiles` está disponible en UTApi pero el nombre
del archivo no es crítico para el funcionamiento. Puede agregarse como mejora V2.

---

#### Checklist de tareas

```
[x] src/lib/media-manager.ts — scanner con ScanResult, FileReference, caché 5 min
    (scanMediaUsage, keysInUse, deleteMediaFiles en chunks de 25)
[x] DELETE /api/admin/media — borrado con re-verificación (keysInUse) + batch + revalidate
[x] GET /api/admin/media/scan — scan fresco forzado (revalida antes de devolver)
    (GET /api/admin/media se mantiene devolviendo {items} para no romper el modal;
     la página usa scanMediaUsage() directo — patrón server-component sin hop HTTP)
[x] src/app/admin/media/page.tsx — Server Component con datos iniciales del scan
[x] src/components/admin/media/media-manager-page.tsx — Client Component:
    tabs (Todos/En uso/Huérfanos), grid responsivo, checkboxes, AlertDialog, paginación 25, toast
[x] Sidebar del admin → link "Medios" (gateado por canManageMedia) + badge de huérfanos
    (fetch no bloqueante a ?stats=1, conteo del scan cacheado)
[x] loading.tsx (skeleton en cache frío) + error.tsx (estado degradado + reintento)
[x] MediaLibraryModal → link "Abrir gestor completo →"
[x] media-cleanup.ts → revalidateTag("media-scan") cuando borra archivos
[ ] E2E manual (requiere servidor + credenciales UploadThing): subir → huérfano →
    eliminar → confirmar desaparece de UTApi
```

---

### ⏳ Bloque 10.5 — Wompi (Colombia — fase futura)

> **Objetivo**: Agregar Wompi como segundo proveedor de pago disponible.
> Activable con solo cambiar `PAYMENT_PROVIDER=wompi` en `.env.local`.
>
> **Prerequisito**: Bloque 10 completo (la abstracción IPaymentProvider ya existe).
>
> **Referencia oficial**:
>
> - Wompi Docs: https://docs.wompi.co/docs/colombia/inicio-rapido/
> - Wompi Transacciones: https://docs.wompi.co/docs/colombia/transacciones/
> - Wompi Métodos de pago: https://docs.wompi.co/docs/colombia/metodos-de-pago/

**Ventaja de Wompi sobre MP para Colombia:**

- Métodos nativos colombianos: Nequi, Bancolombia Transfer, Bancolombia QR,
  BNPL Bancolombia (4 cuotas sin interés ≥ $100.000), Daviplata
- API más simple y predecible
- Llaves públicas/privadas con prefijo claro: `pub_test_` / `pub_prod_` / `prv_test_` / `prv_prod_`

---

#### Arquitectura Wompi

```
Wompi usa un modelo diferente al de MP:
- El monto va en CENTAVOS (amount_in_cents), igual que la DB — sin conversión
- Cada transacción requiere un acceptance_token (JWT de aceptación de T&C)
- Todas las transacciones requieren una firma de integridad (integrity signature)
- Las transacciones siempre arrancan en PENDING → polling o webhook para estado final

URL base sandbox:  https://sandbox.wompi.co/v1/
URL base producción: https://production.wompi.co/v1/
(el client.ts de Wompi infiere cuál usar por el prefijo de las llaves)
```

---

#### Fase 10.5-A: Firma de integridad (OBLIGATORIA en Wompi)

```
Wompi requiere una firma para validar que el monto y la referencia no fueron
manipulados. Se genera en el servidor y se envía junto con la transacción.

Algoritmo SHA-256 (en src/lib/payments/wompi/client.ts):

function buildIntegritySignature(
  reference: string,
  amountInCents: number,
  currency: string,  // "COP"
  expirationTime: string | null,  // ISO 8601 o null
  integritySecret: string
): string {
  // Concatenar en este orden EXACTO:
  const chain = `${reference}${amountInCents}${currency}${expirationTime ?? ''}${integritySecret}`;
  return crypto.createHash('sha256').update(chain).digest('hex');
}

// La firma va en el campo 'signature' del body de la transacción
```

---

#### Fase 10.5-B: Acceptance Token (OBLIGATORIO antes de crear transacción)

```
[ ] Implementar getAcceptanceToken() en wompi/client.ts:
    - GET /v1/merchants/{publicKey}
    - Retorna presigned_acceptance.acceptance_token (JWT corto — expira)
    - Cachear con TTL de 10 minutos (el token dura ~30 min pero es seguro renovar)
    - El acceptance_token se envía en el body de cada transacción
    - Representa que el cliente aceptó los T&C de Wompi
```

---

#### Fase 10.5-C: Tarjetas con Wompi

```
[ ] Tokenización de tarjeta (frontend):
    - Wompi provee Widget de pago (iFrame) o Widget de tokenización standalone
    - Alternativa: POST /v1/tokens/cards directamente (requiere PCI scope propio — NO recomendado)
    - Usar el Widget de Wompi o el WidgetCheckout embebido como iframe
    - El widget retorna un token de tarjeta (tok_prod_xxx o tok_test_xxx)

[ ] Implementar WompiProvider.createCardPayment():
    - Obtener acceptance_token (getAcceptanceToken)
    - Generar referencia única: ORDER-{orderNumber}-{timestamp}
    - Generar firma de integridad (buildIntegritySignature)
    - POST /v1/transactions con Bearer {WOMPI_PRIVATE_KEY}:
      {
        acceptance_token,
        amount_in_cents: amountCents,      // centavos COP directamente (sin conversión)
        currency: "COP",
        customer_email: payer.email,
        payment_method: {
          type: "CARD",
          token,                           // token del widget
          installments
        },
        reference: uniqueRef,
        signature,                         // SHA-256 de integridad
        redirect_url: `${APP_URL}/api/payments/wompi-return?orderId=${orderId}`,
        customer_data: {
          phone_number: payer.phone,
          full_name: `${payer.firstName} ${payer.lastName}`,
          legal_id: payer.identificationNumber,
          legal_id_type: payer.identificationType  // CC, CE, NIT, PAS, TI
        }
      }
    - Estado inicial siempre PENDING — monitorear vía webhook o polling
    - Guardar transaction.data.id como paymentProviderId en Order
```

---

#### Fase 10.5-D: Métodos alternativos Wompi

```
[ ] PSE con Wompi:
    - GET /v1/payment_sources (con llave pública) → lista de bancos PSE
    - POST /v1/transactions con payment_method: { type: "PSE", user_type, financial_institution_code, payment_description }
    - La transacción devuelve redirect_url → redirigir al usuario al banco
    - Webhook confirma cuando el usuario completa la transferencia

[ ] Nequi:
    - POST /v1/transactions con payment_method: { type: "NEQUI", phone_number: "3001234567" }
    - Wompi envía una notificación push a la app Nequi del cliente
    - El cliente acepta en su app → webhook confirma
    - No requiere redirect — flujo 100% asíncrono

[ ] Bancolombia Transfer:
    - POST /v1/transactions con payment_method: { type: "BANCOLOMBIA_TRANSFER", user_type, user_legal_id }
    - Retorna redirect_url → cliente completa en su app/web Bancolombia
    - Webhook confirma

[ ] Bancolombia QR:
    - POST /v1/transactions con payment_method: { type: "BANCOLOMBIA_QR" }
    - Retorna QR image URL → mostrar en pantalla
    - Cliente escanea con su app Bancolombia
    - Webhook confirma (polling cada 5s como fallback)

[ ] UI del selector de método de pago (cuando Wompi está activo):
    Tabs: Tarjeta | PSE | Nequi | Bancolombia | QR Bancolombia
    - Mostrar solo los métodos habilitados (configurable en store.config o Settings)
    - Cada tab tiene su propio formulario/instrucciones
```

---

#### Fase 10.5-E: Webhook Wompi

```
[ ] Crear POST /api/payments/webhook/wompi:
    Algoritmo de verificación de firma:

    1. Leer body raw como string
    2. Extraer event.signature.checksum y event.signature.properties del body
    3. Construir string a hashear concatenando los valores de cada property en orden:
       Ejemplo si properties = ["transaction.id","transaction.status","transaction.amount_in_cents"]:
       chain = `${tx.id}${tx.status}${tx.amount_in_cents}${WOMPI_EVENTS_SECRET}`
    4. SHA-256(chain) debe coincidir con checksum
    5. Si no coincide → 401, loguear
    6. Retornar 200 inmediatamente
    7. En background:
       - Si event.event !== 'transaction.updated' → ignorar
       - Buscar Order por reference (= uniqueRef guardado al crear la transacción)
       - Mapear status: APPROVED→PAID, DECLINED→FAILED, VOIDED→FAILED, ERROR→FAILED
       - Actualizar Order, disparar email, guardar PaymentLog

[ ] Registrar URL del webhook en el panel de Wompi:
    Sandbox: https://comercios.wompi.co (sección Desarrolladores → Webhooks)
    URL: {NEXT_PUBLIC_APP_URL}/api/payments/webhook/wompi

[ ] Tarjetas de prueba Wompi (ambiente sandbox):
    VISA:       4242 4242 4242 4242 | CVV: 123 | Venc: 12/25 → Aprobada
    MasterCard: 5204 7300 0000 1005 | CVV: 123 | Venc: 12/25 → Aprobada
    Rechazo:    4111 1111 1111 1111 → Declinada
    Nequi test: número 3991000000 (sandbox)
```

---

#### Fase 10.5-F: Configuración multi-método en el admin

```
[ ] Extender Settings → "Métodos de pago" (ya existe en el admin):
    Agregar toggles por método específico:
    - [x] Tarjeta de crédito/débito
    - [x] PSE
    - [ ] Nequi (solo Wompi)
    - [ ] Bancolombia Transfer (solo Wompi)
    - [ ] Bancolombia QR (solo Wompi)
    Los toggles de métodos exclusivos de un proveedor se muestran solo cuando
    PAYMENT_PROVIDER=wompi (leer del env en el server component del settings editor)

[ ] El payment-form.tsx lee los métodos habilitados vía useSettings() y solo
    muestra los tabs activos — sin requerir deploy para cambiar métodos disponibles
```

---

#### Checklist final Bloque 10 (MercadoPago) antes de ir a producción

```
[ ] Credenciales de PRODUCCIÓN configuradas (ACCESS_TOKEN empieza con "APP_USR-")
[ ] Webhook URL registrada en panel de MP apuntando al dominio de producción
[ ] MERCADOPAGO_WEBHOOK_SECRET generado y guardado (no regenerar después)
[ ] Verificar que idempotencyKey es @unique en la DB de producción
[ ] Testear con tarjeta real (monto mínimo) en producción antes de lanzar
[ ] Confirmar que /api/payments/webhook/ NO requiere autenticación de NextAuth
    (MP llama sin sesión — debe estar excluido del middleware)
[ ] Confirmar que /api/payments/initiate SÍ requiere orderId válido del usuario en sesión
[ ] Verificar logs en PaymentLog después de primera transacción real
[ ] Activar notificaciones de contracargos (chargebacks) en el panel de MP
```

---

### ⏳ Bloque 10.6 — Stripe (internacional — fase futura)

> **Objetivo**: Agregar Stripe como tercer proveedor de pago para clientes
> internacionales o cuando el repo se replica fuera de Colombia.
> Activable con `PAYMENT_PROVIDER=stripe` en `.env.local`.
>
> **Prerequisito**: Bloque 10 completo (la abstracción `IPaymentProvider` ya existe).
>
> **Cuándo usar Stripe vs MercadoPago/Wompi**:
>
> - Stripe: clientes fuera de Colombia, pagos en USD/EUR, tarjetas internacionales,
>   suscripciones, marketplaces — la API más madura y documentada del mercado.
> - MercadoPago: Colombia/LATAM, PSE, Efecty, billetera MP — mejor tasa de aprobación local.
> - Wompi: Colombia, Nequi, Bancolombia, BNPL — métodos bancarios colombianos nativos.
>
> **Referencia oficial**:
>
> - Stripe Docs: https://stripe.com/docs
> - Stripe Elements: https://stripe.com/docs/stripe-js
> - Stripe Webhooks: https://stripe.com/docs/webhooks

---

#### Diferencias clave de Stripe vs los otros proveedores

```
- Montos en centavos de la moneda destino (USD: cents, COP: centavos — igual que la DB)
- No tiene PSE ni métodos locales colombianos — solo tarjetas, SEPA, etc.
- PaymentIntent es el objeto central (equivalente al "pago" de MP)
- 3DS es automático vía Payment Element — no requiere manejo manual
- Webhook verificado con stripe.webhooks.constructEvent() (librería oficial)
- SDK oficial: npm install stripe (server) + @stripe/stripe-js + @stripe/react-stripe-js (frontend)
- Stripe CLI para testing local: stripe listen --forward-to localhost:3000/api/payments/webhook/stripe
```

---

#### Fase 10.6-A: Setup del cliente Stripe

```
[ ] npm install stripe @stripe/stripe-js @stripe/react-stripe-js

[ ] src/lib/payments/stripe/client.ts:
    import Stripe from 'stripe';
    export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia', // fijar versión de API
      typescript: true,
    });

[ ] Crear PaymentIntent desde el servidor (NO desde el cliente):
    - POST /api/payments/initiate cuando PAYMENT_PROVIDER=stripe:
      const intent = await stripe.paymentIntents.create({
        amount: amountCents,            // centavos COP (o la moneda del cliente)
        currency: 'cop',                // o 'usd', 'eur' según la config de locale
        metadata: { orderId, orderNumber },
        idempotency_key: idempotencyKey,
      });
      retornar { clientSecret: intent.client_secret }
    - El frontend usa el clientSecret para montar el Payment Element
    - NUNCA retornar la llave secreta de Stripe al frontend
```

---

#### Fase 10.6-B: Payment Element (frontend)

```
[ ] StripePaymentForm — componente nuevo (solo se monta cuando PAYMENT_PROVIDER=stripe):
    import { loadStripe } from '@stripe/stripe-js';
    import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

    const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

    // Flujo:
    1. Al llegar al paso 4 del checkout → POST /api/payments/initiate → recibir clientSecret
    2. Montar <Elements stripe={stripePromise} options={{ clientSecret }}>
    3. Dentro: <PaymentElement /> — Stripe renderiza el formulario completo (tarjeta,
       Apple Pay, Google Pay, Link) adaptado al navegador y país del cliente
    4. onSubmit: stripe.confirmPayment({ elements, confirmParams: {
         return_url: `${APP_URL}/api/payments/stripe-return?orderId=${orderId}`
       }})
    5. Stripe maneja 3DS automáticamente — no requiere código adicional

[ ] Ventaja del Payment Element: soporta múltiples métodos de pago en un solo
    componente (tarjeta, Apple Pay, Google Pay, Link) sin código extra.
    Los métodos disponibles se configuran en el Dashboard de Stripe.
```

---

#### Fase 10.6-C: Return URL y webhook Stripe

```
[ ] GET /api/payments/stripe-return:
    - Stripe redirige aquí después de la autenticación 3DS o pago async
    - Query params: payment_intent, payment_intent_client_secret, redirect_status
    - Verificar con stripe.paymentIntents.retrieve(payment_intent)
    - NO confiar en redirect_status del query param (puede manipularse)
    - Buscar Order por metadata.orderId
    - Actualizar estado según intent.status:
      'succeeded'        → PAID + CONFIRMED
      'processing'       → PENDING (pagos bancarios async)
      'payment_failed'   → FAILED
    - Redirigir a /order-success/[id] o /payment-failed/[id]

[ ] POST /api/payments/webhook/stripe:
    Verificación con librería oficial (NO manual):

    const sig = request.headers.get('stripe-signature')!;
    const rawBody = await request.text();
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch {
      return new Response('Webhook signature invalid', { status: 401 });
    }

    Eventos a manejar:
    - 'payment_intent.succeeded'       → Order PAID + CONFIRMED
    - 'payment_intent.payment_failed'  → Order FAILED
    - 'charge.dispute.created'         → loguear (contracargo — notificar admin)
    - Todos los demás → ignorar (retornar 200 igual)

    Registrar URL en Dashboard de Stripe → Webhooks:
    {NEXT_PUBLIC_APP_URL}/api/payments/webhook/stripe

[ ] Testing local con Stripe CLI:
    stripe listen --forward-to localhost:3000/api/payments/webhook/stripe
    stripe trigger payment_intent.succeeded   # simular pago exitoso
    stripe trigger payment_intent.payment_failed

[ ] Tarjetas de prueba Stripe:
    Aprobada:        4242 4242 4242 4242 | CVV: cualquiera | Venc: futura
    3DS requerido:   4000 0025 0000 3155
    Fondos insuf.:   4000 0000 0000 9995
    Rechazada:       4000 0000 0000 0002
```

---

#### Fase 10.6-D: Configuración multi-método en el admin (Stripe)

```
[ ] Los toggles de métodos de pago en Settings → "Métodos de pago" muestran
    opciones relevantes según el proveedor activo:
    - Stripe activo: mostrar toggle "Apple Pay / Google Pay" (se activa en Stripe Dashboard)
    - MP activo: mostrar toggles PSE, Efecty
    - Wompi activo: mostrar Nequi, Bancolombia, BNPL
    El payment-form.tsx renderiza el componente correcto según PAYMENT_PROVIDER
    (MercadoPagoCardForm | MercadoPagoPseForm | WompiWidget | StripePaymentElement)
```

---

#### Checklist Stripe antes de producción

```
[ ] Cuenta Stripe en modo Live (verificada con documentos del negocio)
[ ] Cambiar llaves a sk_live_ / pk_live_
[ ] Webhook registrado en Dashboard con URL de producción
[ ] STRIPE_WEBHOOK_SECRET actualizado con el secreto de producción
[ ] Activar métodos de pago deseados en Dashboard → Settings → Payment methods
[ ] Verificar que la moneda en stripe.paymentIntents.create() coincide con locale.currency
[ ] Testear con tarjeta real (1 USD o equivalente) antes de lanzar
[ ] Activar radar rules en Stripe Dashboard para antifraude automático
```

---

### ⏳ Bloque 11 — Email transaccional

> **Objetivo**: El cliente recibe email automático en cada evento importante.
>
> **🟡 En progreso (2026-06-13)** — infraestructura + 4 de 5 emails implementados.
> Falta solo abandono de carrito (requiere cron) y la prueba con API key real.

**Infraestructura** (`src/lib/email/`):

- `client.ts` — transporte Resend best-effort: nunca lanza (un fallo de envío no
  rompe el flujo que lo dispara) y es no-op con log si falta `RESEND_API_KEY`.
- `templates.ts` — layout HTML email-safe con branding (nombre de marca vivo desde
  settings, `formatPrice` por locale) + plantillas por evento. Funciones puras.
- `index.ts` — disparadores de alto nivel (`sendOrderPlacedEmail`,
  `sendOrderPaidEmail`, `sendOrderShippedEmail`, `sendWelcomeEmail`).

```
[x] Configurar Resend (paquete instalado; RESEND_API_KEY + EMAIL_FROM en .env.example)
[x] Email: Confirmación de pedido (al crear) — número, items, totales, dirección
    de envío, branding. Disparado en POST /api/orders con after() (no bloquea checkout)
[x] Email: Pedido confirmado (pago exitoso) — disparado dentro de markOrderPaid
    (el guard idempotente garantiza envío exactly-once aunque el webhook llegue 2 veces)
[x] Email: Pedido enviado — disparado en PATCH /api/admin/orders/[id] solo en la
    transición a SHIPPED, con after(). (Sin número de guía: no hay campo de tracking
    en el schema — pendiente como mejora futura)
[x] Email: Bienvenida (al crear cuenta) — POST /api/cuenta/register con after()
[x] Email: Abandono de pago (pedido PENDING >24h) — cron diario GET
    /api/cron/abandoned-orders (Vercel Cron, vercel.json), protegido con CRON_SECRET.
    remindAbandonedOrders() reclama el recordatorio con update guardado (no doble envío)
    y solo apunta a PENDING entre 24h y 7 días con email. Campo Order.reminderSentAt
    (migración add_order_reminder_sent_at). NOTA: el carrito vive en localStorage, no
    es detectable; en su lugar se recuperan pedidos creados que nunca se pagaron.
[ ] Verificación E2E con API key real (RESEND_API_KEY) — falta credencial
```

> **Para activar el cron en Vercel**: definir `CRON_SECRET` (p. ej. `openssl rand -hex 32`)
> en las env vars del proyecto. Vercel Cron envía `Authorization: Bearer <CRON_SECRET>`
> automáticamente; el handler falla cerrado si no está configurado. Schedule actual:
> diario 15:00 UTC (~10:00 Colombia).

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

## 🐛 Bloque 13.5 — Vinculación de pedidos guest al iniciar sesión

> **Estado**: pendiente — bug confirmado. El registro ya reclama pedidos, el login no.

### Diagnóstico

El flujo actual tiene una implementación parcial:

| Escenario                                             | Pedidos reclamados                                 |
| ----------------------------------------------------- | -------------------------------------------------- |
| Guest compra → **se registra** con ese email          | ✅ Funciona (`registerCustomer` hace `updateMany`) |
| Guest compra → **inicia sesión** con cuenta existente | ❌ No funciona — `authorize` no reclama nada       |
| Usuario registrado compra como guest → inicia sesión  | ❌ No funciona — mismo gap en `authorize`          |

**Raíz del bug**: el claiming (`prisma.order.updateMany({ where: { userId: null, customerEmail: email } })`)
está embebido en `registerCustomer()` (`src/lib/account.ts:70`) pero nunca se llama
desde el callback `authorize` en `src/lib/auth-options.ts`.

### Archivos clave

```
src/lib/account.ts          — registerCustomer() tiene el claiming embebido (línea 68-71)
src/lib/auth-options.ts     — authorize() no llama a claiming tras login exitoso
```

### Plan de implementación

**Paso 1 — Extraer utilidad `claimGuestOrders`** en `src/lib/account.ts`:

```typescript
// Mueve la lógica embebida a una función reutilizable:
export async function claimGuestOrders(email: string, userId: string): Promise<number> {
  const { count } = await prisma.order.updateMany({
    where: { userId: null, customerEmail: email.trim().toLowerCase() },
    data: { userId },
  })
  return count // útil para logging / tests
}
```

**Paso 2 — Refactorizar `registerCustomer`** para usar la utilidad (sin cambiar comportamiento):

```typescript
// En registerCustomer(), reemplazar el updateMany embebido por:
await claimGuestOrders(email, user.id)
```

**Paso 3 — Agregar claiming en el login** (`src/lib/auth-options.ts`):

```typescript
async authorize(credentials) {
  // ... validación existente ...
  const passwordValid = await bcrypt.compare(credentials.password, user.password)
  if (!passwordValid) return null

  // Reclamar pedidos guest con este email (no-op si no hay ninguno)
  await claimGuestOrders(user.email, user.id)

  return { id: user.id, email: user.email, name: user.name, role: { ... } }
}
```

### Edge cases

| Caso                                  | Comportamiento esperado                                 |
| ------------------------------------- | ------------------------------------------------------- |
| No hay pedidos guest con ese email    | `claimGuestOrders` hace 0 updates — no-op seguro        |
| Pedido ya reclamado (`userId ≠ null`) | Excluido por `WHERE userId IS NULL` — safe              |
| Admin inicia sesión                   | Claiming corre, no encuentra nada — no-op               |
| Email diferente al del checkout guest | No hay match — correcto (no reclamar pedidos ajenos)    |
| Registro concurrente mismo email      | Prisma unique constraint en `email` previene duplicados |

### Checklist

> **✅ Completado 2026-06-13.**

```
[x] Extraer claimGuestOrders(email, userId) en src/lib/account.ts (normaliza email, retorna count)
[x] Refactorizar registerCustomer para usar claimGuestOrders (comportamiento idéntico)
[x] Agregar await claimGuestOrders(...) en authorize() de src/lib/auth-options.ts (tras validar password)
[x] Actualizar scripts/verify-account.mjs con caso de login-claiming (logout → guest checkout → login → 2 pedidos)
[ ] Test manual E2E (requiere servidor) — verify:account cubre el flujo
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

---

## 🔍 Bloque 14 — Auditoría Profunda & Plan de Mejora para Fable 5

> **Cómo usar este bloque**: cada sección tiene items accionables con rutas de archivo
> exactas y descripciones del problema. Asignar a Fable 5 como contexto completo +
> una sección por sesión. Prioridad A = bloqueante para producción; B = importante;
> C = mejora de calidad.

---

### 14.1 — Seguridad (revisar antes de cualquier deploy a producción)

#### 🔴 Prioridad A — Críticos

**[A-1] Sin headers de seguridad HTTP** ✅ Resuelto 2026-06-11

- Resolución: `next.config.ts` define `async headers()` con X-Frame-Options DENY,
  X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy, CSP completa
  (MP secure fields, UploadThing, Google Fonts) y HSTS condicionado a producción.
  Verificado con curl contra `next start` (HSTS presente) y `next dev` (HSTS ausente).

- Archivo: `next.config.ts`
- Problema: el config no define `headers()`. Sin CSP, HSTS, X-Frame-Options,
  X-Content-Type-Options ni Referrer-Policy. Un navegador moderno no tiene ninguna
  protección declarativa.
- Fix esperado: agregar `async headers()` en `next.config.ts` con al menos:
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`,
  `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (solo producción).
  CSP es complejo con MP iframes pero debe tener al menos `default-src 'self'` con
  las excepciones mínimas necesarias (sdk.mercadopago.com, \*.ufs.sh, fonts.googleapis.com).

**[A-2] Sin rate limiting en login y registro** ✅ Resuelto 2026-06-13

- Resolución: rate limiting sin Redis basado en Prisma (`RateLimitHit`, ventana
  deslizante, fail-open). `src/lib/rate-limit.ts` expone `isRateLimited` (check) y
  `recordRateLimitHit` (registro + poda oportunista). Login (`auth-options.ts`
  `authorize`): 5 intentos/10 min por email, registra solo fallos, lanza error con
  mensaje claro al exceder (mostrado por `login-form`). Registro
  (`register/route.ts`): 5 cuentas/hora por IP (`x-forwarded-for`), retorna 429.
  Migración `add_rate_limit_hits` aplicada.

- Archivos: `src/lib/rate-limit.ts` (nuevo), `src/lib/auth-options.ts`,
  `src/app/api/cuenta/register/route.ts`, `prisma/schema.prisma`

**[A-3] Stock NO se restaura al fallar o cancelar un pedido** ✅ Resuelto 2026-06-11

- Resolución: `markOrderFailed()` ya restauraba stock en transacción guardada e
  idempotente (verificado). Faltaba la cancelación desde el admin: el PATCH de
  `/api/admin/orders/[id]` ahora pasa por `markOrderFailed()` cuando el status
  destino es CANCELLED, restaurando stock solo si el pago no había settleado.
  Pedidos PAID solo cambian de status (el restock en refunds se decide aparte).

- Archivos: `src/lib/orders.ts`, `src/app/api/payments/initiate/route.ts`,
  `src/app/api/payments/webhook/mercadopago/route.ts`
- Problema crítico de negocio: el stock se descuenta cuando se CREA el pedido
  (`createOrder` → `updateMany { decrement: qty }`). Si el pago falla (webhook rejected,
  PSE rechazado, timeout), el pedido queda en `FAILED` pero el stock nunca se restaura.
  El inventario queda incorrecto indefinidamente.
- Fix esperado: en `markOrderFailed()` agregar `restoreOrderStock(orderId)` que haga
  `updateMany { increment: qty }` por cada `OrderItem` del pedido, dentro de una
  transacción. También aplicar en cancelaciones del admin.
- Verificar: `src/lib/orders.ts` función `markOrderFailed` — confirmar que no
  llama ninguna restauración de stock.

**[A-4] `order-success/[id]` no verifica propiedad del pedido** ✅ Resuelto 2026-06-13

- Resolución: `getOrderForConfirmation(id, viewerId?)` ahora scopea por dueño: un
  pedido con `userId` solo es legible por ese usuario (devuelve `null` → la página
  hace `notFound()`, sin revelar existencia); los pedidos guest (sin `userId`) siguen
  accesibles por su CUID-capability. La página `order-success` obtiene la sesión y
  pasa `session.user.id`; el endpoint `GET /api/orders/[id]` (usado por el poller)
  aplica la misma verificación.

- Archivos: `src/lib/orders.ts`, `src/app/(store)/order-success/[id]/page.tsx`,
  `src/app/api/orders/[id]/route.ts`

**[A-5] Fuga de rol en JWT — cambios de rol no se propagan** ✅ Resuelto 2026-06-13

- Resolución: el callback `jwt` de `auth-options.ts` re-lee el rol del usuario desde
  la DB cada `ROLE_SYNC_TTL_MS` (5 min). Un cambio de rol o degradación toma efecto en
  ≤5 min sin esperar a que expire el token. Un usuario `INACTIVE`/eliminado recibe
  `REVOKED_ROLE` (permisos `{}` + slug customer → el middleware lo saca del admin).
  `roleSyncedAt` añadido al tipo JWT. Costo por request: una query cada 5 min por sesión.
- Archivos: `src/lib/auth-options.ts`, `src/types/next-auth.d.ts`

#### 🟠 Prioridad B — Importantes

**[B-1] `/api/payments/simulate` — ¿está gateado a dev?** ✅ Verificado/endurecido 2026-06-13

- Resolución: ya estaba gateado por `isMockPaymentsEnabled()` (solo activo cuando el
  proveedor es `mock`). Se añadió una segunda capa defensiva: el handler retorna 404
  también si `NODE_ENV === "production"`, cubriendo el caso en que `PAYMENT_PROVIDER`
  quede sin definir en prod (cuyo default es `mock`). El `mock-provider` solo
  redirige a `/pago/[orderId]`; no liquida pagos (eso es del endpoint, ya bloqueado).

- Archivo: `src/app/api/payments/simulate/route.ts`

**[B-2] Password sin límite de longitud máxima (bcrypt trunca a 72 bytes)** ✅ Resuelto 2026-06-13

- Resolución: `assertValidPassword()` en `src/lib/account.ts` (min 8 chars + máx
  `PASSWORD_MAX_BYTES`=72) usado en `registerCustomer` y `changePassword`. El admin
  `users POST` aplica la misma validación de bytes. Rechaza con mensaje claro en lugar
  de truncar en silencio.
- Archivos: `src/lib/account.ts`, `src/app/api/admin/users/route.ts`

**[B-3] `customer_role_id` cacheado a nivel de módulo en serverless**

- Archivo: `src/lib/account.ts` (variable `customerRoleId`)
- Problema: el cache de módulo vive por instancia Lambda/worker. En un deploy fresh
  o tras un cold start de Vercel, la caché está vacía y hace una query. No es un bug
  de seguridad grave, pero si el rol customer se elimina y recrea con otro ID, el
  caché queda obsoleto en instancias calientes.
- Acción: verificar si `ensureCustomerRole` es idempotente y su `upsert` correctamente
  maneja el caso de reconexión.

**[B-4] Sin validación del `orderId` en `/api/payments/initiate` para PSE**

- Archivo: `src/app/api/payments/initiate/route.ts`
- Revisar: la ruta verifica que el pedido pertenece al usuario en sesión (`getOrderPaymentInfo`
  con `userId`). Confirmar que esto también aplica para guests (que no tienen sesión) y
  que no hay forma de iniciar pago en un pedido ajeno enviando un `orderId` arbitrario.

**[B-5] Admin APIs — verificar que TODAS validan sesión + permiso** ✅ Auditado 2026-06-13

- Resultado: los 12 route handlers admin (categories, products, orders, users,
  roles, settings, media, media/scan — GET/POST/PUT/PATCH/DELETE) verifican
  `getServerSession` + `hasPermission(resource, action)` con el recurso/acción
  correctos. Sin rutas que solo validen sesión. Protecciones extra correctas:
  users PATCH/DELETE bloquean auto-modificación; roles DELETE protege isSystem y
  roles en uso; settings PUT valida la key contra whitelist.
- Hallazgo corregido — **mass-assignment en products**: POST/PUT/PATCH hacían
  `data: body` (sin whitelist, a diferencia de users/roles que ya filtraban
  campos). Ahora usan `pickProductInput()` (whitelist en `src/lib/product-input.ts`).
- Endurecido — **users POST**: valida que `roleId` exista (evita 500 por FK → 400)
  y longitud mínima de contraseña.
- Auto-escalada de `roles:update` ✅ mitigada 2026-06-13: el PATCH de `roles/[id]`
  rechaza (403) cualquier cambio de `permissions` sobre el rol que el propio usuario
  tiene, cerrando la vía de auto-escalada.

#### 🟡 Prioridad C — Menores

**[C-1] Contraseña sin requisitos de complejidad**

- Archivo: `src/lib/account.ts`
- Solo verifica longitud ≥ 8. Sin mayúscula, número ni símbolo. Para una tienda
  de producción es insuficiente. Considerar `zxcvbn` para score de fortaleza.

**[C-2] Emails no verificados**

- Archivo: `src/app/api/cuenta/register/route.ts`
- El registro acepta cualquier email sin verificación. Riesgo: cuentas spam con
  emails de terceros. Fix: enviar email de verificación (se alinea con Bloque 11).

---

### 14.2 — Bugs confirmados

**[BUG-1] Shipping cost en pedidos NO usa la config del admin** ✅ Resuelto 2026-06-11

- Resolución: `createOrder()` llama `loadAllSettings()` y `shippingCostFor()` recibe
  `{ freeThreshold, standardCost }` como parámetro. Verificado E2E: con
  `standardCost=12000` en la tabla Setting, el pedido cobró 12000 de envío.
  `cart-summary` y `order-confirmation` ya usaban `useSettings()`; `mini-cart`
  no muestra costo de envío.

- Archivos: `src/lib/orders.ts` línea ~10:
  ```typescript
  import { shipping } from "@/config/store.config"
  ```
- Problema: el costo y umbral de envío que se aplican al crear pedidos vienen del
  archivo de config estático, NO de `loadAllSettings()`. Si el admin cambia el costo
  de envío en Settings → Envíos, los nuevos pedidos siguen usando el valor hardcodeado.
- Fix: en `createOrder()`, llamar `loadAllSettings()` para leer `shipping` desde la DB.
  Ojo: `loadAllSettings` es async — la función `shippingCostFor` debe recibir los valores
  como parámetro en vez de leerlos del módulo.
- Verificar también: `cart-summary` y `mini-cart` — ¿usan `useSettings()` o el config estático?

**[BUG-2] `pago-fallido` no sabe cuál pedido falló → stock y carrito inconsistentes** ✅ Resuelto 2026-06-13

- Resolución: todos los redirects a `/pago-fallido` ahora incluyen `?orderId=` (pse-return,
  order-success, página de pago y el simulador). La página lee `searchParams.orderId` y
  muestra "Intentar de nuevo" → `/pago/[orderId]` cuando está presente (fallback genérico
  si no). Copy corregido: "No se realizó ningún cargo. Puedes intentar el pago de nuevo."
  (ya no dice "siguen en el carrito"). La consistencia de stock la cubre [A-3].

- Archivos: `src/app/(store)/pago-fallido/page.tsx`,
  `src/app/api/payments/pse-return/route.ts`, `src/app/(store)/order-success/[id]/page.tsx`,
  `src/app/(store)/pago/[orderId]/page.tsx`, `src/components/checkout/simulated-payment-actions.tsx`

**[BUG-3] `order-success` sin polling para PSE pendiente** ✅ Resuelto 2026-06-13

- Resolución: bloque de estado de pago extraído a `PaymentStatusPoller` (Client
  Component). Si llega ya `PAID`/`FAILED` no hace polling; si está pendiente consulta
  `GET /api/orders/[id]` cada 5s y transiciona la UI en vivo (verde al confirmar,
  error + link a `/pago-fallido?orderId=` al fallar). Tope de 60 intentos (5 min) →
  "Verifica tu correo para la confirmación del banco". Limpia carrito al pasar a PAID
  (reemplaza `ClearCartOnPaid`, ahora eliminado). Cleanup del intervalo en `useEffect`.

- Archivos: `src/components/payment/payment-status-poller.tsx` (nuevo),
  `src/app/(store)/order-success/[id]/page.tsx`

**[BUG-4] Hot-reload de Next.js HMR orphana los iframes de MP**

- Archivo: `src/components/payment/mp-card-form.tsx`
- Problema conocido y documentado: cuando HMR reemplaza el componente en dev, el SDK
  de MP mantiene los iframes ligados al DOM antiguo. El componente remontado crea
  nuevos iframes pero los del SDK siguen apuntando a los elementos eliminados → campos
  silenciosos que no responden.
- Fix pendiente: detectar en `mount()` si ya existen iframes del SDK en los
  contenedores (`document.getElementById('mp-card-number')?.querySelector('iframe')`)
  y forzar un `unmount()` previo antes de remontar. O bien: agregar un aviso en dev
  `"Recarga completa necesaria (Cmd+Shift+R) después de cambios en este componente"`.

**[BUG-5] `nextOrderNumber()` puede generar colisiones bajo carga alta (edge case)**

- Archivo: `src/lib/orders.ts::nextOrderNumber`
- Problema: cuenta pedidos del año (`count`) dentro de la transacción y hace `count + 1`.
  Bajo dos transacciones simultáneas con el mismo count, ambas intentan crear el mismo
  número. El retry a nivel de `createOrder` captura la violación única y reintenta,
  pero el gap en la numeración queda (DI-2026-003 se salta si hubo colisión).
  No es un bug grave en bajo volumen, pero documentar el comportamiento esperado.
- Revisar: confirmar que el campo `orderNumber` tiene `@unique` en el schema de Prisma.

**[BUG-6] Admin sidebar — permisos no reflejados en tiempo real**

- Archivo: `src/components/admin/sidebar.tsx`
- Revisar: si el sidebar filtra items por los permisos del JWT (snapshot en login),
  un cambio de permisos por otro admin no se refleja hasta que el usuario cierra sesión.
  Documentar o agregar un "refresh permisos" en el sidebar.

---

### 14.3 — Review de flujos (verificar E2E con Fable 5)

Cada flujo debe verificarse con Playwright o manualmente. Los pasos marcados `[RIESGO]`
son los que más frecuentemente fallan en producción.

#### Flujo 1: Compra con tarjeta (happy path)

```
[ ] 1. Agregar producto al carrito — verificar que StockBadge refleja stock real
[ ] 2. Ir a carrito → ¿precio y envío usan settings de la DB?    [RIESGO: BUG-1]
[ ] 3. Checkout paso 1–3 → crear pedido → redirige a /pago/[orderId]
[ ] 4. /pago: CardForm monta iframes en < 3s (verificar en red lenta)
[ ] 5. Llenar: tarjeta APRO (5254...) → Titular: APRO → CVV: 123 → Exp: 11/30
[ ] 6. Submit → spinner → "Procesando pago…"
[ ] 7. Respuesta aprobada → /order-success → ¿carrito limpiado?
[ ] 8. Verificar en DB: Order.paymentStatus = PAID, stock decrementado
[ ] 9. Verificar PaymentLog: evento "initiate.card" + "webhook.payment.approved"
```

#### Flujo 2: Rechazo de tarjeta y reintento

```
[ ] 1. Pagar con nombre FUND (fondos insuficientes)
[ ] 2. Respuesta rejected → mensaje de error en la página de pago
[ ] 3. Verificar: Order sigue en PENDING (no FAILED)    [RIESGO: debe poder reintentar]
[ ] 4. Verificar: paymentProviderId NO guardado (para que el webhook muerto no cancele)
[ ] 5. Cambiar nombre a APRO → pagar de nuevo → aprobado
[ ] 6. Verificar: stock decrementado UNA sola vez (no dos)    [RIESGO crítico]
```

#### Flujo 3: PSE completo

```
[ ] 1. Crear pedido → /pago → seleccionar PSE
[ ] 2. Llenar banco, tipo persona, CC, número
[ ] 3. Submit → verificar redirect a banco    [necesita credenciales test-seller]
[ ] 4. Simular retorno desde banco vía /api/payments/pse-return?orderId=X
[ ] 5. Verificar: si webhook llegó antes del return → route a /order-success correctamente
[ ] 6. Verificar: si payment rejected → /pago-fallido con orderId    [RIESGO: BUG-2]
[ ] 7. Verificar: stock restaurado si PSE falla    [RIESGO: A-3]
```

#### Flujo 4: Webhook idempotente (entrega duplicada)

```
[ ] 1. Enviar mismo webhook approved dos veces
[ ] 2. Verificar: segunda entrega es no-op (Order ya en PAID → guarda no ejecuta)
[ ] 3. Verificar: PaymentLog tiene dos registros (correcto — es auditoría, no operación)
[ ] 4. No debe haber error 500 en la segunda entrega
```

#### Flujo 5: Gestión de stock en admin

```
[ ] 1. Admin edita stock de producto → verificar storefront actualiza
[ ] 2. Producto llega a stock=0 → StockBadge dice "Agotado" → botón deshabilitado
[ ] 3. Crear pedido con producto stock=1 → verificar stock llega a 0 tras pago
[ ] 4. Pago falla → verificar stock se restaura a 1    [RIESGO: A-3 no implementado]
[ ] 5. Admin cancela pedido PAID → verificar stock NO se restaura (ya enviado)
```

#### Flujo 6: Cuenta de cliente y reclamación de pedidos

```
[ ] 1. Comprar como guest con email X
[ ] 2. En order-success → click "Crear cuenta" → registro con email X
[ ] 3. Verificar: en /cuenta/pedidos aparece el pedido guest reclamado
[ ] 4. Verificar: favoritos de localStorage se mergearon a DB
[ ] 5. Login con cuenta existente → favoritos DB sobrescriben o mergeán los de localStorage
```

#### Flujo 7: Admin — ciclo completo de pedido

```
[ ] 1. Pedido llega en estado PENDING → admin ve en lista
[ ] 2. Admin actualiza a CONFIRMED → ¿email disparado?    [Bloque 11 pendiente]
[ ] 3. Admin actualiza a SHIPPED → ¿aparece campo de guía?
[ ] 4. Admin intenta cancelar pedido PAID → ¿sistema lo permite? ¿restaura stock?
[ ] 5. Admin ve PaymentLog en detalle de pedido    [posiblemente no existe aún en UI]
```

#### Flujo 8: Theming en vivo

```
[ ] 1. Admin cambia color primario → guardar → verificar storefront actualiza (ISR tag)
[ ] 2. Cambiar fuente → verificar que los iframes de MP NO pierden sus colores
       (probeFieldStyle usa el color al momento del mount, no después)    [BUG potencial]
[ ] 3. Admin cambia costo de envío → verificar que NUEVO pedido usa costo nuevo
       [RIESGO: BUG-1 — órdenes usan store.config, no settings]
```

---

### 14.4 — Performance & Caché

> **🚀 Audit de rendimiento — implementado 2026-06-13.** Hallazgos corregidos:
>
> - **Catálogo cacheado + revalidado** (`src/lib/products.ts`): todas las lecturas
>   del storefront ahora usan `unstable_cache` bajo el tag `products` (ventana ISR
>   5 min); las mutaciones de producto llaman `revalidateProducts()`. Antes
>   `/products` y el home quedaban **congelados al build** (un producto editado no
>   aparecía nunca). Resultado del build: `/products/[id]` pasó de `ƒ Dynamic` a
>   `● SSG` (prebuild + ISR), `/products` y `/category/sales` ganaron revalidación 5m.
> - **Detalle de producto sin doble query**: `generateMetadata` y la página
>   compartían dos `getProductById`; al cachearlo, es una sola lectura por render.
>   `generateStaticParams` prebuildea todos los productos publicados.
> - **Lista de pedidos del admin sin over-fetch**: `include` de todos los items →
>   `_count` (solo el número que se muestra).
> - **Pool de Prisma acotado** (`max: 5`, `idleTimeoutMillis`) para serverless.
> - **`recharts` eliminado** (dependencia + `ui/chart.tsx` muertos, sin importadores).
> - **Logo del header a `next/image`** con `priority`; `priority` en las primeras 4
>   cards de `/products` (home/categoría ya lo tenían). `/api/admin/products` GET
>   acotado con `take: 100`.

**[PERF-1] `loadAllSettings` no se usa en la capa de pedidos**

- Impacto: `createOrder` usa `shipping` del config estático. Fix = usar settings de DB.
- También revisar: `src/app/(store)/checkout-flow/page.tsx` — ¿el subtotal de envío
  mostrado en el checkout usa el mismo cálculo que `createOrder`?

**[PERF-2] Admin dashboard — múltiples queries sin batching**

- Archivo: `src/app/admin/page.tsx`
- Revisar si las stats (total pedidos, total ventas, total usuarios, etc.) se hacen
  con `Promise.all()` o secuencialmente. Si son secuenciales, paralelizarlas.

**[PERF-3] Sin paginación en listas del admin** ✅ Ya resuelto (verificado 2026-06-13)

- Ambas listas ya paginan con `take: 20` + `skip` (offset) y controles en la UI:
  productos (`?q`/`?page` + `ProductsTable`) y pedidos (`?status`/`?page` con
  "X–Y de N" + Anterior/Siguiente). No carga todos los registros. Se mantuvo offset
  (no cursor): a esta escala el patrón "página X de Y" es mejor UX y reescribir a
  cursor sería refactor sin beneficio funcional.

**[PERF-4] `lucide-icons.ts` registra 1594 íconos en bundle**

- Archivo: `src/lib/lucide-icons.ts`
- Se usa en `icon-picker.tsx` (admin) y en el storefront para resolver íconos del
  trust-bar por nombre. Si este módulo llega al bundle del cliente, es pesado.
- Verificar: ¿tiene `"server-only"`? ¿El trust-bar resuelve íconos en el servidor?

**[PERF-5] Caché de settings — verificar que `revalidateTag("settings")` funciona E2E**

- Archivos: `src/lib/settings.ts`, `src/app/api/admin/settings/route.ts`
- Flujo: `saveSetting()` llama `revalidateTag("settings")` → la próxima request
  al storefront debe generar una respuesta fresca. Verificar con un test: cambiar un
  setting en admin → esperar < 1s → hacer fetch al storefront → confirmar nuevo valor.

**[PERF-6] Imágenes — verificar `sizes` en ProductCard para LCP**

- Archivo: `src/components/product/product-card.tsx`
- Confirmar que el `sizes` prop de `next/image` es preciso para evitar que el navegador
  descargue imágenes más grandes de lo necesario. Revisar en DevTools → Network.

---

### 14.5 — UX & Experiencia del Cliente

**[UX-1] `/pago-fallido` sin contexto del pedido**

- Problema: la página es genérica, sin número de pedido ni "Intentar de nuevo".
- Fix: aceptar `?orderId=` y mostrar botón "Reintentar" → `/pago/[orderId]`.

**[UX-2] `order-success` en PSE pendiente no tiene auto-refresh**

- Problema: el usuario no sabe si el pago fue confirmado sin refrescar manualmente.
- Fix: polling client-side de `paymentStatus` cada 5s (ver BUG-3).

**[UX-3] Búsqueda (`/search`) sin paginación ni estado vacío claro**

- Archivo: `src/app/(store)/search/page.tsx`
- Revisar: ¿qué pasa con `?q=` vacío? ¿Hay manejo de "sin resultados" con sugerencias?

**[UX-4] Sin feedback visual en admin al cambiar estado de pedido**

- Archivo: `src/components/admin/orders/order-status-updater.tsx`
- Revisar: ¿hay toast de confirmación? ¿El botón tiene loading state?

**[UX-5] Carrito sin guardar al refrescar en checkout**

- El checkout de 4 pasos usa estado local. Si el usuario refresca en el paso 3,
  pierde la información de envío. Considerar `sessionStorage` como backup de borrador.

**[UX-6] Admin pedidos — sin acción masiva de estado**

- No hay forma de marcar 10 pedidos como "Enviados" a la vez. Para operar a escala
  es necesario. Agregar checkbox + acción masiva en la tabla de pedidos.

**[UX-7] Sin indicador de "stock bajo" en el admin de productos** ✅ Resuelto 2026-06-13

- `ProductsTable` ahora muestra `StockBadge` por fila: rojo "Agotado" (stock 0),
  ámbar "Stock bajo (N)" (`isLowStock`), verde con el número si está OK — usando
  `isLowStock`/`isOutOfStock` de `src/lib/inventory.ts` (sin hardcodear el umbral).
  Filtro server-side `?stock=low|out` con tabs Todos/Stock bajo/Agotados (preserva `q`).
- Archivos: `src/app/admin/productos/page.tsx`,
  `src/components/admin/products/products-table.tsx`

**[UX-8] Admin — PaymentLog no visible en detalle del pedido** ✅ Resuelto 2026-06-13

- `src/app/admin/pedidos/[id]/page.tsx` agrega sección "Historial de pagos" (tabla
  fecha/hora · evento · proveedor · provider id · status, más reciente primero; sin
  `rawPayload`). "Sin intentos de pago registrados." cuando no hay logs. Query
  `paymentLogs` ordenada desc en el include del pedido.

---

### 14.6 — Deuda Técnica & Arquitectura

**[ARCH-1] `shipping` hardcoded en `orders.ts` — desacoplarlo de settings**

- Ver BUG-1. Es la deuda técnica más impactante en el flujo de negocio.

**[ARCH-2] JWT sessions — considerar rotación automática de rol**

- Ver A-5. El riesgo es bajo en producción temprana pero debe estar en el radar.

**[ARCH-3] `mock-provider.ts` — confirmar que no puede activarse en producción** ✅ Verificado 2026-06-13

- El `mock-provider` solo crea un redirect a `/pago/[orderId]`; no liquida pagos. La
  única superficie de ataque era `/api/payments/simulate`, ahora con doble gate
  (`isMockPaymentsEnabled()` + 404 en `NODE_ENV=production`). Ver [B-1].

**[ARCH-4] Error boundaries — auditar cobertura en Server Components**

- Next.js App Router: un Server Component async que lanza puede burbujear al
  `error.tsx` más cercano. Verificar que las páginas del storefront con datos de Prisma
  tienen error boundaries apropiados (`loading.tsx` + `error.tsx` en las carpetas necesarias).

**[ARCH-5] `src/app/(store)/essentials/page.tsx` — verificar si es redundante** ✅ Verificado 2026-06-13

- No es redundante: es un `permanentRedirect("/category/essentials")` (solo mantiene
  viva la URL antigua). Sin lógica propia que duplique la ruta dinámica. Se conserva.

**[ARCH-6] `use-toast.ts` — shadcn toast legacy vs Sonner** ✅ Resuelto 2026-06-13

- Dead code confirmado por grep (ningún importador): eliminados `src/hooks/use-toast.ts`
  y `src/components/ui/toaster.tsx` (shim sin uso). Sonner (`ui/sonner` en el root
  layout) es el único toaster activo.

**[ARCH-7] Tipos de pago en `types.ts` del SDK vs tipos internos**

- Archivo: `src/lib/payments/types.ts`
- El tipo `CreateCardPaymentInput` tiene `amountCents: number` pero el comentario dice
  "centavos" mientras que el proveedor de MP trabaja en pesos (no centavos).
  El campo está mal documentado — puede confundir a quien implemente Wompi/Stripe.
  Renombrar a `amount` y clarificar la unidad en el tipo (o usar un branded type).

---

### 14.7 — Features de Alto Valor Pendientes (ordenados por impacto)

| #   | Feature                                                  | Impacto    | Bloque        |
| --- | -------------------------------------------------------- | ---------- | ------------- |
| 1   | **Email transaccional** (pedido confirmado, enviado)     | ⭐⭐⭐⭐⭐ | 11            |
| 2   | **Restauración de stock en fallo de pago**               | ⭐⭐⭐⭐⭐ | 14 (A-3)      |
| 3   | ~~**Rate limiting en auth**~~ ✅                         | ⭐⭐⭐⭐   | 14 (A-2)      |
| 4   | **Headers de seguridad HTTP** ✅                         | ⭐⭐⭐⭐   | 14 (A-1)      |
| 5   | **PSE sandbox E2E** (con credenciales test-seller)       | ⭐⭐⭐⭐   | 10            |
| 6   | ~~**Polling en order-success para PSE**~~ ✅             | ⭐⭐⭐     | 14 (UX-2)     |
| 7   | ~~**PaymentLog en UI del admin**~~ ✅                    | ⭐⭐⭐     | 14 (UX-8)     |
| 8   | ~~**Paginación en admin**~~ ✅                           | ⭐⭐⭐     | 14 (PERF-3)   |
| 9   | **Google Analytics 4 + Meta Pixel**                      | ⭐⭐⭐     | 12            |
| 10  | **Wompi** (Nequi, Bancolombia, PSE nativo)               | ⭐⭐⭐     | 10.5          |
| 11  | **Cancelación de pedido con restauración de stock**      | ⭐⭐⭐     | —             |
| 12  | **Imágenes reales de productos** (migrar de placeholder) | ⭐⭐       | 9 (pendiente) |
| 13  | ~~**Stock bajo en admin**~~ ✅                           | ⭐⭐       | 14 (UX-7)     |
| 14  | **Stripe** (clientes internacionales)                    | ⭐⭐       | 10.6          |

---

### 14.8 — Cómo sacarle el máximo a Fable 5

Fable 5 es especialmente bueno en razonamiento multi-archivo y detección de
inconsistencias sutiles entre capas. Prompt recomendado por tipo de tarea:

**Para búsqueda de bugs:**

```
Contexto: e-commerce Next.js 15, Prisma, MercadoPago.
Archivos relevantes: [listar los de la sección].
Tarea específica: [nombre del bug].
Confirma si el bug existe, muestra la línea exacta del problema y propone el fix
con el código completo del cambio. Si no existe, explica por qué.
```

**Para review de seguridad:**

```
Haz un security review de [archivo/ruta]. Busca específicamente:
injection, auth bypass, información sensible expuesta, inputs sin validar.
Retorna solo hallazgos reales con línea de código, severidad (crítico/importante/menor)
y fix propuesto.
```

**Para implementación de features:**

```
Implementa [feature] en este proyecto.
Stack: Next.js 15 App Router, TypeScript strict, Tailwind v4, Prisma v7, PostgreSQL.
Restricciones: no comentarios innecesarios, no abstracciones prematuras,
el monto siempre viene de la DB, nunca del cliente.
Archivos existentes relacionados: [listar].
```

**Orden de ejecución recomendado (prioridad para producción):**

1. [A-3] Restaurar stock en fallo → `src/lib/orders.ts` ✅
2. [A-1] Headers HTTP → `next.config.ts` ✅
3. [BUG-1] Shipping desde DB → `src/lib/orders.ts` ✅
4. [BUG-2] pago-fallido con orderId → `src/app/(store)/pago-fallido/` ✅
5. [A-2] Rate limiting → `src/app/api/cuenta/register/`, `src/lib/auth-options.ts` ✅
6. [BUG-3] Polling PSE → `src/app/(store)/order-success/[id]/` ✅
7. [A-4] Ownership check en order-success ✅
8. Bloque 11 (emails) — 🟡 4/5 (falta abandono de carrito + key real)

---

## ✅ Estado del Bloque 14 y pendientes para producción

> Actualizado 2026-06-13. Casi todo el Bloque 14 quedó resuelto en las sesiones de
> Fable 5/Opus. Lo que falta para cerrar producción:

**Bloqueante (antes de cobrar de verdad):**

- [ ] Prueba sandbox E2E de MercadoPago con ngrok: tarjeta APRO (pago + stock−),
      tarjeta FUND (rechazo reintentable), cancelación (restock), PSE, webhook firmado.
      **Runbook paso a paso: [`docs/MERCADOPAGO-E2E.md`](MERCADOPAGO-E2E.md)** (Bloque 10)
- [ ] `RESEND_API_KEY` real + verificar entrega de los 5 emails. (Bloque 11)
- [ ] `CRON_SECRET` en Vercel para activar el recordatorio de pago abandonado.

**Importante (no bloqueante):**

- [x] [A-5] Propagación de cambios de rol en JWT (re-sync cada 5 min) ✅
- [x] [B-2] Password: límite máximo de 72 bytes (bcrypt) en registro/cambio ✅
- [x] Auditoría: guard de auto-escalada en `roles:update` ✅
- [x] Recordatorio de pago abandonado (cron diario + email) ✅ — falta definir
      `CRON_SECRET` en Vercel para activarlo

**Mejoras de calidad (cuando haya tiempo):**

- [ ] [C-1] Requisitos de complejidad de contraseña (zxcvbn)
- [ ] [C-2] Verificación de email en el registro
- [ ] Número de guía/tracking en el email de "pedido enviado" (falta campo en schema)
- [ ] Imágenes reales de productos (migrar de placeholder)

**Resuelto en estas sesiones:** ítems 1-14 del plan Fable 5 (stock-restore, headers,
shipping-DB, pago-fallido, rate-limit, polling PSE, ownership, login-claiming,
PaymentLog UI, stock bajo, simulate gate, dead code, Media Manager, paginación),
auditorías Sec.4 (admin APIs + fix mass-assignment) y Sec.5 (flujo de pagos, sin
hallazgos), e infraestructura de emails transaccionales (4/5).

---

## 🛍️ Bloque 15 — Paridad con Shopify (catálogo, conversión, operación)

> Iniciado 2026-06-24. Investigación de features de Shopify cruzada contra el
> código actual para cerrar brechas y dar más facilidades a clientes y admins.
> Se ejecuta **por fases en orden**; cada fase se documenta aquí al cerrarse.

### Análisis de brechas (resumen)

**Referencia Shopify** (fuentes: help.shopify.com, shopify.com/blog 2026):

- **Imágenes**: hasta **250 medios** por producto (imágenes + video + 3D); **1
  imagen por variante** (al elegir color cambia la foto).
- **Variantes**: hasta **2.048 variantes** y **3 opciones** por producto; cada
  variante con su propio stock, precio, SKU y código de barras.
- **Inventario**: multi-ubicación, order routing, transferencias, stock por
  ubicación.
- **Organización**: colecciones manuales **y** automáticas (smart, por
  condiciones), tags, metafields (datos estructurados).
- **Checkout**: cupones (código) y descuentos automáticos (%, fijo, BXGY, envío
  gratis), combinables; gift cards multi-moneda.
- **Storefront**: reviews 1-5★, wishlist, back-in-stock/preorder.
- **Envíos/impuestos**: zonas y tarifas por región/peso/precio, IVA/landed cost.
- **Marketing**: carrito abandonado (email/SMS), segmentación, automatizaciones.

### Brecha más grande detectada: **no hay variantes reales**

`Product.sizes[]`/`colors[]` son listas de texto sueltas y `stock` es **único y
global**. No se puede saber cuántas unidades quedan por talla×color → riesgo de
**sobreventa**. Es el cimiento a construir (Fase A.2).

### Plan por fases

**🔴 Fase A — Cimientos del catálogo**

```
[x] A.1 Galería de imágenes (ProductImage[])  ✅ Completado 2026-06-24
[x] A.2 Variantes reales (ProductVariant: talla×color, stock/precio/SKU/imagen)  ✅ 2026-06-24
[ ] A.3 Cargar imágenes reales de productos (migrar de placeholder)
```

**🟠 Fase B — Conversión y operación**

```
[x] B.1 Cupones / descuentos (Discount: %, fijo, envío gratis) + UI checkout  ✅ 2026-06-24
[x] B.2 Reviews reales (modelo Review; recalcula rating/reviewCount)  ✅ 2026-06-24
[x] B.3 Zonas de envío + IVA configurables  ✅ 2026-06-24
[x] B.4 Número de guía/tracking en pedido + email "enviado"  ✅ 2026-06-24
[x] B.5 Acciones masivas en admin de pedidos + import/export CSV de productos  ✅ 2026-06-24
[x] B.6 Back-in-stock ("avísame cuando vuelva")  ✅ 2026-06-24
```

**🟢 Fase C — Crecimiento**

```
[x] C.1 Colecciones automáticas (smart, por condiciones)  ✅ 2026-06-24
[x] C.2 Analytics GA4 + Meta Pixel + OG por producto (= Bloque 12)  ✅ 2026-06-24
[x] C.3a Guía de tallas (modal con tabla bebés/niños)  ✅ 2026-06-24
[ ] C.3b Tags de producto (+ condición de tag en colecciones smart)
[ ] C.3c Preventa (preorder: vender agotados marcados)
[ ] C.3d Gift cards  — bloque futuro dedicado (instrumento de pago con saldo)
[ ] C.3e Multi-ubicación de inventario  — bloque futuro dedicado (overhaul de stock)
[ ] C.3f Metafields  — bloque futuro (datos estructurados arbitrarios)
```

**✅ Fase D — UX & Conversión (análisis competidores)** — 2026-06-24

> Análisis de 5 competidores directos del mercado infantil Colombia:
> **Offcorss.us**, **Tomaticos.com**, **BabyFresh.co**, **MagicBabyCol.com** y
> **BabyCentro.com**. Se identificaron patrones UX comunes y se implementaron
> los 4 más impactantes del primer análisis (Offcorss). Los hallazgos restantes
> se programan en Fase E.

```
[x] D.1 Newsletter pop-up modal (10% OFF primera compra, dismiss en localStorage, delay 5s)  ✅ 2026-06-24
[x] D.2 Category pills (quick-links debajo del hero, lee categorías activas de la DB)  ✅ 2026-06-24
[x] D.3 Gender tabs section ("Niños" / "Niñas" con tab-switch, muestra productos por categoría)  ✅ 2026-06-24
[x] D.4 SEO content block (bloque H2/H3 keyword-rich al final del home, antes del footer)  ✅ 2026-06-24
```

---

### Análisis Competitivo Detallado (2026-06-24)

#### Competidores Analizados

| Competidor           | Plataforma     | Enfoque                           | Ubicación                |
| -------------------- | -------------- | --------------------------------- | ------------------------ |
| **Offcorss.us**      | Custom/Shopify | Ropa infantil premium (0-16 años) | Medellín                 |
| **Tomaticos.com**    | Shopify        | Ropa infantil económica           | Ibagué (Grupo Carolina)  |
| **BabyFresh.co**     | Shopify        | Ropa bebé/niño algodón (0-6 años) | Sabaneta (Crystal S.A.S) |
| **MagicBabyCol.com** | Shopify        | Productos/juguetes bebé variado   | Colombia                 |
| **BabyCentro.com**   | Shopify        | Productos premium/importados      | Bogotá                   |

#### Hallazgos por Competidor

**Offcorss.us** — Marca líder, referente de UX:

- Newsletter pop-up con incentivo (10-15% OFF)
- Category pills tipo "TOPS / BOTTOMS / SETS" debajo del hero
- Gender tabs "Shop Boys" / "Shop Girls" con productos filtrados
- SEO content block extenso al final del home
- Mega-menú con imágenes y subcategorías anidadas
- "Shop the Look" (outfits completos, cross-sell)
- Envío gratis con umbral prominente en header
- Recomendaciones "Complete the look" en detalle de producto

**Tomaticos.com** — Ropa infantil económica:

- Homepage con tabs: "Más Vendidos" / "Lo Nuevo" / "Grandes Descuentos"
- Badge de descuento prominente (-50%) en cada card de producto
- Hover swap: segunda imagen se muestra al pasar el mouse sobre la card
- Wishlist integrada (ícono corazón en navbar, página dedicada)
- Grid visual de categorías con imagen (Niño, Niña, Bebé Niña, Bebé Niño, Tennis)
- Newsletter en homepage con checkbox de términos
- Instagram feed embebido (Instafeed)
- Precio tachado + precio de oferta siempre visible
- Sello "Marca País" como trust signal

**BabyFresh.co** — Marca grande (Crystal S.A.S):

- 3 promo banners rotativos en header ("Rebajas", "Envío gratis >$149.990", "Paga con ADDI")
- Subcategoría pills: "Camisetas", "Vestidos", "Conjuntos", "Pijamas"
- "Descubre más de Baby Fresh" — banners por segmento (Bebés Niñas, Bebés Niños, Niñas, Niños)
- Ratings inline con conteo (★★★★★ (23)) en product cards
- BNPL integrado (ADDI — Compra ahora, paga después)
- "Rastrea tu pedido" — página pública de tracking
- "Recoge en tienda" (Click & Collect)
- Tiendas físicas con store locator
- Cookie consent banner (Pandectes)
- Blog "Nuestro blog" (contenido de marca)
- Tarjeta regalo como producto
- FAQ page dedicada
- Cupones y códigos (página informativa)
- "Añadir a favoritos" en cada card con corazón

**MagicBabyCol.com** — Productos variados bebé:

- Secciones del home organizadas **por uso/ocasión**: "Alimentación y Lactancia", "Hora de Dormir", "Juegos para Aprender", "Ropa Niño y Niña"
- "Los Más Vendidos" como primera sección del home (social proof)
- **Testimonios masivos con fotos** — app Revie con 80+ reseñas con imagen real del producto
- WhatsApp flotante (wa.me link directo con mensaje pre-escrito)
- Botón "Agregar al carrito" directamente en la product card (quick-add)
- Promo bar: "👶🏻 Todo lo que necesitas para tu bebé lo encuentras aquí 👶🏻"
- Instagram feed embebido (@magicbabycol)
- Cookie consent banner con opción "No acepto" / "Sí acepto"
- Google Maps link (enlace a reseñas de Google)
- Categorías en el nav con imagen de ícono por cada una
- Footer con links de políticas, categorías y redes sociales

**BabyCentro.com** — Premium/importado:

- Banners full-width por categoría con copy + CTA ("La Seguridad Primero", "Es Hora de Comer!")
- Tabs por subcategoría dentro de secciones (Sillas/Coches/De Paseo/Equipo Viaje)
- Showcase de marcas/logos (Globber, Sophie La Girafe, Pigeon, Palmers, etc.)
- Blog "De Mamá a Mamá" con artículos de crianza (contenido SEO + engagement)
- "Listas de Regalos" (gift registry)
- Badge de descuento (-14%, -20%, -40%) en cards
- "AGREGA A CARRO" — botón quick-add prominente en cada product card
- Vendor/marca visible en cada product card
- Instagram feed embebido (@babycentrocom)
- Íconos de métodos de pago en footer (Visa, Mastercard, AmEx, Diners, Discover, Maestro)
- Chat WhatsApp con asesor en línea
- Envío gratis diferenciado por zona: "$300.000 Bogotá — $500.000 resto del país"
- Sección "Categorías" con grid de imágenes circulares al final del home
- Newsletter "Suscríbete a BabyCentro" en footer

#### Matriz Comparativa — Estado Actual de Dulce Infancia

| Patrón UX                   | Dulce Infancia | Offcorss | Tomaticos | BabyFresh | MagicBaby | BabyCentro |
| --------------------------- | :------------: | :------: | :-------: | :-------: | :-------: | :--------: |
| Newsletter popup            |       ✅       |    ✅    |    ✅     |     —     |     —     |     ✅     |
| Category pills              |       ✅       |    ✅    |    ✅     |    ✅     |    ✅     |     ✅     |
| Gender/age tabs             |       ✅       |    ✅    |     —     |    ✅     |     —     |     ✅     |
| SEO content block           |       ✅       |    ✅    |     —     |    ✅     |     —     |     —      |
| Reviews/ratings             |       ✅       |    ✅    |     —     |    ✅     |    ✅     |     —      |
| Cupones/descuentos          |       ✅       |    ✅    |    ✅     |    ✅     |     —     |     ✅     |
| Favoritos/wishlist          |       ✅       |    ✅    |    ✅     |    ✅     |     —     |     ✅     |
| Envío gratis (umbral)       |       ✅       |    ✅    |     —     |    ✅     |     —     |     ✅     |
| Trust bar                   |       ✅       |    ✅    |     —     |     —     |     —     |     —      |
| Promo banner                |       ✅       |    ✅    |     —     |  ✅ (×3)  |    ✅     |     —      |
| Back-in-stock               |       ✅       |    —     |     —     |     —     |     —     |     —      |
| Variantes (talla×color)     |       ✅       |    ✅    |    ✅     |    ✅     |     —     |     ✅     |
| Galería multi-imagen        |       ✅       |    ✅    |    ✅     |    ✅     |    ✅     |     ✅     |
| Zonas de envío              |       ✅       |    ✅    |     —     |     —     |     —     |     ✅     |
| Tracking de pedido          |       ✅       |    ✅    |     —     |    ✅     |     —     |     —      |
| **WhatsApp flotante**       |       ❌       |    —     |     —     |     —     |    ✅     |     ✅     |
| **Badge % descuento**       |       ❌       |    ✅    |    ✅     |    ✅     |     —     |     ✅     |
| **Hover swap (2da img)**    |       ❌       |    ✅    |    ✅     |    ✅     |    ✅     |     ✅     |
| **"Más Vendidos" section**  |       ❌       |    —     |    ✅     |     —     |    ✅     |     —      |
| **Quick add-to-cart**       |       ❌       |    —     |     —     |     —     |    ✅     |     ✅     |
| **Cookie consent**          |       ❌       |    —     |     —     |    ✅     |    ✅     |     —      |
| **Instagram feed**          |       ❌       |    —     |    ✅     |     —     |    ✅     |     ✅     |
| **Blog / contenido**        |       ❌       |    ✅    |     —     |    ✅     |     —     |     ✅     |
| **Logos métodos de pago**   |       ❌       |    ✅    |     —     |     —     |     —     |     ✅     |
| **BNPL (ADDI)**             |       ❌       |    —     |     —     |    ✅     |     —     |     —      |
| **Testimonios con foto**    |       ❌       |    —     |     —     |     —     |    ✅     |     —      |
| **Secciones por ocasión**   |       ❌       |    —     |     —     |     —     |    ✅     |     ✅     |
| **Shop the Look (outfits)** |       ❌       |    ✅    |     —     |     —     |     —     |     —      |
| **Gift registry**           |       ❌       |    —     |     —     |     —     |     —     |     ✅     |
| **Store locator**           |       ❌       |    —     |     —     |    ✅     |     —     |     —      |

---

**✅ Fase E — UX Competitivo (hallazgos análisis multi-competidor)** — completa 2026-06-24

> Patrones identificados en 4+ competidores que Dulce Infancia aún no tiene.
> Priorizados por impacto en conversión × esfuerzo de implementación.

```
[x] E.1 WhatsApp flotante (botón fijo bottom-right, link wa.me con mensaje pre-escrito)  ✅ 2026-06-24
[x] E.2 Badge % descuento en product cards (badge -XX% cuando hay ahorro real)  ✅ 2026-06-24
[x] E.3 Hover swap en product cards (muestra 2da imagen de galería al hover)  ✅ 2026-06-24
[x] E.4 Sección "Más Vendidos" en home (ordenar por ventas/popularidad)  ✅ 2026-06-24
[x] E.5 Quick add-to-cart en product cards (botón "Agregar" directo, sin ir al detalle)  ✅ 2026-06-24
[x] E.6 Cookie consent banner (cumplimiento legal Colombia, localStorage)  ✅ 2026-06-24
[x] E.7 Instagram feed embebido en home (grid shoppable + CTA al perfil)  ✅ 2026-06-24
[x] E.8 Blog básico (modelo Post + /blog + 3 artículos SEO de crianza)  ✅ 2026-06-24
[x] E.9 Logos de métodos de pago en footer (Visa, MC, AmEx, MercadoPago, PSE, Nequi)  ✅ 2026-06-24
[x] E.10 Testimonios en home (mejores reseñas + foto del producto reseñado)  ✅ 2026-06-24
```

#### Priorización sugerida

| Prioridad            | Items              | Razón                                                              |
| -------------------- | ------------------ | ------------------------------------------------------------------ |
| 🔴 Alta (hacer ya)   | E.1, E.2, E.3, E.6 | Bajo esfuerzo, alto impacto conversión, 4/5 competidores lo tienen |
| 🟠 Media             | E.4, E.5, E.9      | Impacto medio, esfuerzo moderado                                   |
| 🟡 Baja (planificar) | E.7, E.8, E.10     | Mayor esfuerzo o dependencias externas (API Instagram, contenido)  |

#### Log de implementación Fase C

- **C.1 Colecciones automáticas (smart)** ✅ — `Category.rules` (Json, migración
  `add_category_rules`): cuando tiene condiciones, la categoría lista productos
  por reglas en vez de asignación manual. Motor puro `lib/collection-rules.ts`
  (`parseRules` + `rulesToWhere`) con condiciones onSale/new/featured/priceMin/
  priceMax/category y `match` all|any; reglas inválidas → filtro que no matchea
  (no muestra todo el catálogo). `getProductsByRules` en el data layer; el page
  `/category/[slug]` branchea (smart vs manual). Admin: `CollectionRulesEditor`
  en `CategoryForm` (toggle + condiciones); `normalize` limpia las reglas y
  create/update revalidan también el tag `products`. Verificado E2E: colección
  con regla `onSale=true` lista exactamente los 5 productos en oferta.

- **C.3a Guía de tallas** ✅ — `SizeGuideModal` (autocontenido, Escape/click-fuera,
  scroll-lock) con tablas de referencia bebés/niños (talla·edad·estatura·peso);
  trigger junto al selector de talla en el detalle.
- **C.2 Analytics GA4 + Meta Pixel + OG** ✅ — `lib/analytics.ts` (dispatch a
  `gtag`/`fbq`, no-op si no hay IDs) + `AnalyticsScripts` (inyecta GA4 gtag.js y
  Meta Pixel vía `next/script afterInteractive` cuando hay env vars; trackea page
  views en cambios de ruta App Router). Eventos cableados: `view_item`
  (product-detail), `add_to_cart` (cart-provider), `begin_checkout`
  (checkout-flow, una vez), `purchase` (order-success, solo si PAID, fire-once).
  IDs por env: `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID` (en `.env.example`).
  OG por producto ya existía en `products/[id]` generateMetadata. Verificado: con
  IDs se inyecta el script de GA4; sin IDs, 0 scripts.

#### Log de implementación Fase E

- **E.1 WhatsApp flotante** ✅ — `WhatsAppFloat` (cliente) lee `social.whatsapp`
  de settings, normaliza número o URL → `wa.me/<n>?text=...` con mensaje
  pre-escrito con el nombre de marca; no renderiza nada si no está configurado.
  Montado en el layout de tienda. Verificado: con número renderiza el enlace
  correcto; vacío → oculto.
- **E.2 Badge % descuento** ✅ — el badge `-XX%` en `ProductCard` y
  `ProductDetail` ahora aparece siempre que hay ahorro real (`originalPrice >
price`), consistente con el precio tachado (antes exigía además `isOnSale`).
- **E.3 Hover swap** ✅ — `ProductCard` superpone la primera foto de galería
  distinta de la portada (`product.images`) con fade en `group-hover`; sin
  galería se comporta igual que antes (solo zoom de la portada).
- **E.4 Más vendidos** ✅ — `getBestSellingProducts` rankea por unidades vendidas
  reales (`groupBy` de `OrderItem._sum.quantity`) y rellena con destacados/
  recientes si faltan; sección `BestSellers` en la home entre destacados y género.
- **E.5 Quick add-to-cart** ✅ — `ProductCard` agrega directo (qty 1, abre
  mini-cart) cuando el producto no tiene variantes/tallas/colores y hay stock;
  si requiere elegir → CTA "Elegir opciones" al detalle (no se elige talla por el
  cliente en silencio); agotado → "Ver producto".
- **E.6 Cookie consent** ✅ — `CookieConsent` (banner inferior, client-only tras
  mount para evitar hydration mismatch) recuerda la aceptación en localStorage;
  copy referencia la Ley 1581/2012. Montado en el layout de tienda.
- **E.7 Instagram feed** ✅ — `InstagramFeed` (grid "shoppable" de fotos reales de
  producto que enlazan al producto + CTA al perfil de `social.instagram`,
  parseando handle o URL). Se oculta sin handle o sin fotos reales (se activa con
  A.3). Sin API externa: honesto, sin posts falsos.
- **E.9 Medios de pago** ✅ — fila de chips wordmark (Visa, Mastercard, Amex,
  MercadoPago, PSE, Nequi) en el footer; sin assets de logos de terceros para
  evitar uso indebido de marcas.
- **E.10 Testimonios** ✅ — `getFeaturedReviews` (cacheado tag `posts`/products)
  trae las mejores reseñas (≥4★ con comentario) con su producto; sección
  `Testimonials` en la home (cita + estrellas + avatar inicial + **foto del
  producto reseñado** enlazada). Se oculta sin reseñas que califiquen.
- **E.8 Blog** ✅ — modelo `Post` (migración `add_blog_posts`) + `lib/blog.ts`
  (cacheado tag `posts`) + páginas `/blog` (lista) y `/blog/[slug]` (ISR,
  generateMetadata + OG, contenido HTML con tipografía vía `[&_h2]`…); 3 artículos
  SEO sembrados con `yarn db:seed-blog` (idempotente por slug); enlace en footer +
  posts en `sitemap.ts`. Nota: contenido es HTML confiable (seed); un editor
  público futuro debe sanitizar.

### A.1 — Galería de imágenes ✅ (2026-06-24)

> El producto pasó de **1 imagen** a **portada + galería ordenada**. Retro-
> compatible: `Product.image` sigue siendo la portada (thumbnail de las cards);
> la galería son fotos adicionales del detalle.

**Modelo**: nuevo `ProductImage { id, productId, url, alt?, position }` (cascade
on delete del producto) + relación `Product.images`. Migración
`20260624212405_add_product_images`.

**Data layer** (`src/lib/products.ts`): `STOREFRONT_SELECT` incluye `images`
(ordenadas por `position`); `toProduct` las mapea a `Product.images` (tipo
`ProductImageDto` en `types.ts`).

**Storefront** (`product-detail.tsx`): galería compuesta `[portada, ...extra]`
deduplicada por URL; imagen principal + tira de miniaturas (solo si hay >1 foto),
con estado de imagen activa y accesibilidad (`aria-pressed`, labels).

**Admin**: nuevo `GalleryUploadField` (subir varias vía UploadThing, elegir de la
biblioteca, reordenar con flechas, quitar; ignora duplicados). El `ProductForm`
maneja `images: string[]` y lo envía en el body.

**API** (`/api/admin/products` POST + `[id]` PUT/PATCH/DELETE): `pickGalleryUrls`
parsea el array; create usa nested `images.create`; update reemplaza las filas en
transacción (`deleteMany` + `createMany`) y **limpia de UploadThing** las fotos
huérfanas (portada reemplazada + galería ya no referenciada); delete borra los
archivos de portada + galería.

**Verificado**: type-check + lint limpios; detalle de producto HTTP 200; prueba
con 2 imágenes insertadas → renderiza 3 miniaturas (portada + 2). Pendiente real:
cargar fotos reales desde el admin (A.3).

### A.2 — Variantes reales (estilo Shopify) ✅ (2026-06-24)

> Cada combinación **talla × color** es una variante con su propio **stock,
> precio (vacío = hereda el del producto), SKU e imagen**. Resuelve la
> sobreventa: el stock ya no es global. Retrocompatible: los productos sin
> variantes siguen usando `stock`/`price`/`sizes`/`colors` del producto.

**Modelo**: nuevo `ProductVariant { size?, color?, sku? @unique, price?, stock,
imageUrl?, position }` (cascade del producto) + relación `Product.variants` +
`OrderItem.variantId` con `onDelete: SetNull` (borrar una variante no rompe el
historial; el OrderItem ya guarda size/color/price). Migración
`20260624213625_add_product_variants`.

**Data layer** (`products.ts`): `STOREFRONT_SELECT` incluye `variants`;
`toProduct` resuelve el precio efectivo (variante o producto) y calcula el
**stock total = suma de variantes** cuando existen. Tipo `ProductVariantDto`.

**Storefront** (`product-detail.tsx`): cuando hay variantes, los selectores de
talla/color se derivan de ellas; al elegir combo se resuelve la variante →
muestra su **precio**, su **stock** (`StockBadge`) y su **imagen** (cambia la
principal). El CTA exige elegir un combo válido ("Selecciona talla y color") y se
deshabilita si la variante está agotada. El carrito lleva `variantId` + precio e
imagen de la variante en la línea.

**Admin**: nuevo `VariantEditor` (filas con talla, color, SKU, precio, stock e
imagen; agregar/quitar) en `ProductForm`. La página de edición carga `variants`.

**API**: `pickVariants` parsea/limpia las filas; create usa nested
`variants.create`; update **reemplaza** el set en transacción; SKU duplicado →
HTTP 409 con mensaje claro. La limpieza de UploadThing ahora cubre también las
imágenes de variante huérfanas.

**Checkout/pedidos** (`orders.ts`, ruta crítica de dinero/stock): el server
descuenta el stock **de la variante** con el mismo guard anti-sobreventa
(`updateMany ... stock >= qty`), resuelve el **precio server-side** (variante o
producto), y guarda `variantId` en el `OrderItem`. El restock en `markOrderFailed`
(usado también por la cancelación admin) devuelve el stock a la variante correcta.

**Verificado E2E** (pedido real vía `POST /api/orders`, guest): pedido de variante
con stock → **201** y stock de esa variante 3→2 (las otras intactas); pedido de
variante agotada → **400 OUT_OF_STOCK**; `OrderItem` guardó `variantId` y el
**precio de la variante** (39.000, no el base 20.000). type-check + lint limpios.

### B.1 — Cupones / descuentos ✅ (2026-06-24)

> Códigos de descuento aplicables en el checkout: **% , monto fijo y envío
> gratis**. Validados y consumidos **server-side** (nunca se confía en el cliente).

**Modelo**: `Discount { code @unique, type (enum PERCENTAGE/FIXED/FREE_SHIPPING),
value, minSubtotal?, maxRedemptions?, redemptions, isActive, startsAt?, endsAt? }`

- `Order.discountCode/discountAmount` (snapshot auditable). Migración
  `add_discounts`. Nuevo recurso de permisos `discounts` (otorgado a super_admin y
  admin en seed + BD).

**Lógica** (`src/lib/discounts.ts`): `validateDiscount` (read-only, para el
preview) y `consumeDiscountInTx` (revalida + incrementa `redemptions` con guard
`updateMany ... redemptions < max` dentro de la transacción del pedido, así un
código con tope no se sobre-canjea). `computeDiscount` puro calcula el monto
(% sobre subtotal, fijo topado al subtotal, o el costo de envío para envío gratis).

**Checkout/pedidos** (`orders.ts`): `createOrder` acepta `discountCode`, lo
consume server-side y guarda `discountCode`/`discountAmount`; `total = subtotal +
envío − descuento`. Un código inválido se trata como "sin descuento" (no rompe el
pedido). El DTO de confirmación y `OrderSummary` muestran la línea de descuento.

**Storefront**: `checkout/cart-summary.tsx` tiene campo de código que llama a
`POST /api/discounts/validate` (preview) y muestra la línea de descuento + total
ajustado; el checkout envía `discountCode` en el pedido.

**Admin**: nueva sección `/admin/descuentos` (en el sidebar, gated por permiso
`discounts`) — crear códigos, activar/desactivar, ver usos y eliminar. APIs
`/api/admin/discounts` (+`[id]`) con whitelist `pickDiscountInput` y 409 en código
duplicado.

**Verificado E2E**: validación 10% de 100.000 → 10.000; pedido real con código →
**201**, `subtotal 40.000 + envío 10.000 − 4.000 = total 46.000`, `discountCode`
guardado y `redemptions` 0→1. type-check + lint limpios.

### B.2 — Reseñas reales ✅ (2026-06-24)

> Reseñas de clientes (1–5★ + comentario) en el detalle de producto. Una por
> usuario por producto. El `rating`/`reviewCount` del producto se **recalcula**
> desde las reseñas aprobadas (deja de ser un número estático del seed).

**Modelo**: `Review { productId, userId?, authorName, rating (1–5), comment?,
isApproved, createdAt }` con `@@unique([productId, userId])` + relaciones en
`Product` y `User`. Migración `add_reviews`.

**Lógica** (`src/lib/reviews.ts`): `createReview` valida (1–5, una por usuario),
crea la reseña y **recalcula el agregado** (`_avg`/`_count`) del producto en la
misma transacción; luego `revalidateProducts()` para refrescar la tienda.
`getProductReviews` lee las aprobadas.

**API**: `POST /api/products/[id]/reviews` — **requiere sesión** (el nombre del
autor sale de la sesión, no del cliente); 401 sin login, 409 si ya reseñó.

**Storefront**: `ReviewsSection` (cliente) bajo el detalle — lista de reseñas +
formulario con selector de estrellas; si no hay sesión muestra enlace a login.
La página sigue siendo ISR: las reseñas se cargan en el server (cacheadas) y el
estado de login se resuelve con `useSession` (nuevo `AuthSessionProvider` que
envuelve solo la sección, sin volver dinámica la página).

**Verificado E2E** (login NextAuth real): sin sesión → **401**; con sesión →
**201** y agregado del producto recalculado (rating 4, count 1); segunda reseña
del mismo usuario → **409**. type-check + lint limpios.

> Nota: los productos del seed traen `rating`/`reviewCount` ficticios; ahora que
> hay reseñas reales, esos valores se recalculan a medida que llegan reseñas (un
> producto sin reseñas reales mostrará 0). No se migran retroactivamente.

### B.3 — Zonas de envío + IVA ✅ (2026-06-24)

> Tarifas de envío por **zona** (departamento) e **IVA** configurable, ambos
> resueltos con la misma lógica en el servidor y en el preview del checkout.

**Config** (`store.config.ts shipping`): agrega `zones [{ name, states[], cost }]`,
`taxRate` (%) y `taxIncluded` (bool, default true = precios con IVA incluido,
estilo Colombia). `Order.taxAmount` nuevo (migración `add_order_tax`).

**Lógica compartida** (`src/lib/shipping.ts`): `resolveShippingCost(subtotal,
state, cfg)` → gratis sobre el umbral, si no la primera zona cuyo `states`
incluye el departamento (match sin acentos/mayúsculas), o el costo estándar.
`computeTax(base, cfg)` → monto de IVA (porción incluida o sumada).

**Pedidos** (`orders.ts`): el envío se resuelve por `customer.state`; el IVA se
calcula sobre el subtotal post-descuento y se guarda en `taxAmount`. Con
`taxIncluded` el total no cambia (IVA ya dentro); si no, se suma.

**Admin** (`shipping-editor.tsx`): sección "Envíos e impuestos" con IVA %,
checkbox "precios incluyen IVA" y editor de zonas (nombre, departamentos, costo).

**Checkout**: `cart-summary` usa `resolveShippingCost` con el `state` del
formulario (el preview refleja la zona al elegir departamento) y muestra la línea
de IVA; `OrderSummary` muestra IVA en la confirmación.

**Verificado E2E**: pedido a Cundinamarca (zona=5.000, no el estándar 10.000) con
IVA 19% incluido → `taxAmount 6.387` (=40.000−40.000/1,19), `total 45.000`
(subtotal+envío, IVA no se suma). type-check + lint limpios. Config de prueba
reseteada a defaults (sin zonas, IVA 0).

---

_Para estándares de calidad y arquitectura de datos ver `STANDARDS.md`. Para visión de negocio ver `PROJECT.md`._
