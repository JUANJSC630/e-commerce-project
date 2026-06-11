# Dulce Infancia — E-Commerce Platform

Plataforma de comercio electrónico completa para una tienda de ropa infantil colombiana. Construida con Next.js 15 App Router, Prisma v7 y MercadoPago Checkout API. Incluye storefront público, panel de administración multi-rol y flujo de pagos reales con tarjeta y PSE.

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router + Turbopack) | 15.3.3 |
| Lenguaje | TypeScript strict | ^5 |
| UI | React | ^19 |
| Estilos | Tailwind CSS v4 + OKLCH tokens | ^4.1 |
| Componentes | shadcn/ui (Radix UI) | latest |
| ORM | Prisma con driver adapters (`PrismaPg`) | ^7.8 |
| Base de datos | PostgreSQL (Prisma Postgres — pooled, SSL) | — |
| Autenticación | NextAuth.js v4 (JWT + Credentials) | ^4.24 |
| Pagos | MercadoPago Checkout API (tarjeta + PSE) | — |
| Imágenes | UploadThing v7 | ^7.7 |
| Email | Resend | Bloque 11 |
| Deploy | Vercel | — |

---

## Módulos implementados

### Storefront (`/`)
- Home administrable: hero con banners, categorías destacadas, tira de confianza con íconos dinámicos y sección de propuesta de valor — todo editable desde el admin sin tocar código
- Catálogo de productos con filtros por precio, talla y color (sidebar desktop, drawer mobile)
- Detalle de producto con galería, badge de stock, productos relacionados y variantes
- Carrito persistido en `localStorage` con mini-cart en el header
- Favoritos sincronizados en DB (usuarios logueados) y `localStorage` (guests)
- Búsqueda en tiempo real por nombre, categoría y descripción
- Categorías dinámicas administrables (`/category/[slug]`)

### Checkout y pedidos
- Checkout de 4 pasos: carrito → datos de envío → método de pago → confirmación
- Autocompletado de dirección: País / Departamento / Ciudad encadenados con autodetección por IP
- Creación de pedido transaccional con descuento de stock atómico (sin oversell)
- Numeración secuencial anual: `DI-2026-001`
- Guest checkout + reclamación de pedidos al registrarse

### Pagos (MercadoPago Checkout API)
- **Tarjeta**: CardForm con iframes PCI-compliant de MercadoPago; el número de tarjeta nunca toca el servidor
- **PSE**: formulario con 47 bancos colombianos, redirect al banco y verificación del resultado
- Webhook firmado HMAC-SHA256 con procesamiento asíncrono via `after()`
- Idempotency key persistida antes de llamar al proveedor (protección anti–doble cobro)
- Capping de intentos por pedido (anti card-testing)
- Arquitectura multi-proveedor lista para Wompi y Stripe (`IPaymentProvider`)
- Auditoría completa en tabla `PaymentLog`

### Panel de administración (`/admin`)
- Dashboard con estadísticas de ventas, pedidos y stock + gráficos (Recharts)
- CRUD completo de productos, categorías, pedidos, usuarios y roles
- Sistema de roles con permisos granulares por módulo y acción (read/create/update/delete)
- Editor de configuración con 9 secciones: Marca, Localización, Tema, Tipografía, Envíos, Pagos, Promociones, Redes sociales, Contacto
- Editor visual de tema: color pickers OKLCH, presets, vista previa en vivo y verificación de contraste WCAG AA
- FontPicker con ~65 Google Fonts con preview en la propia fuente, aplicado al storefront en vivo
- Editor de contenido del home: banners, categorías destacadas, tira de confianza — con drag & drop para reordenar
- Gestor de imágenes: biblioteca de medios, limpieza automática de huérfanos en el CDN al reemplazar/eliminar

### Cuenta de cliente (`/cuenta`)
- Registro, login, cambio de contraseña
- Historial de pedidos con estado y detalle completo
- Verificación de propiedad: un usuario solo ve sus propios pedidos

---

## Arquitectura del proyecto

```
src/
├── app/
│   ├── (store)/          # Storefront — layout con header, footer, cart
│   ├── admin/            # Panel admin — layout con sidebar y sesión
│   └── api/
│       ├── auth/         # NextAuth (JWT + Credentials)
│       ├── admin/        # APIs protegidas del admin (sesión + permisos)
│       ├── payments/     # Pagos: initiate, webhook, pse-return, banks
│       ├── orders/       # Pedidos: crear, consultar
│       ├── products/     # Catálogo público
│       └── uploadthing/  # File router con auth por permiso
├── components/
│   ├── admin/            # Componentes del dashboard
│   ├── payment/          # CardForm, PSEForm, hub de pago
│   ├── checkout/         # 4 pasos del flujo de compra
│   ├── home/             # Secciones del home (SOLID, Server Components)
│   └── ui/               # shadcn/ui + combobox propio
├── lib/
│   ├── payments/         # Abstracción multi-proveedor (IPaymentProvider)
│   │   └── mercadopago/  # Cliente, proveedor, webhook, mapper
│   ├── orders.ts         # createOrder transaccional, markOrderPaid/Failed
│   ├── settings.ts       # loadAllSettings() con caché por tag
│   ├── products.ts       # Repositorio server-only Prisma → Product
│   ├── categories.ts     # Repositorio server-only + revalidación ISR
│   ├── media-cleanup.ts  # Limpieza de huérfanos en UploadThing CDN
│   └── theme.ts          # Sanitización y generación de CSS vars del tema
├── config/
│   ├── store.config.ts   # Defaults de marca, rutas, nav, SEO, contenido
│   └── theme.config.ts   # Paleta OKLCH y tipografía por defecto
└── middleware.ts          # Protege /admin/* y /cuenta/* con NextAuth JWT
```

---

## Puesta en marcha

### Requisitos previos
- Node.js ≥ 20
- Yarn
- PostgreSQL (o una instancia de Prisma Postgres)

### Instalación

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd e-commerce-project

# 2. Instalar dependencias
yarn install

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus credenciales
# DATABASE_URL va en .env (Prisma CLI solo lee .env)

# 4. Aplicar migraciones y seed inicial
yarn prisma migrate deploy
yarn prisma db seed

# 5. Iniciar el servidor de desarrollo
yarn dev
```

Abre [http://localhost:3000](http://localhost:3000) para el storefront y [http://localhost:3000/admin](http://localhost:3000/admin) para el panel.

### Cuenta admin por defecto (seed)

El seed crea un usuario administrador inicial. Las credenciales están en `prisma/seed.ts`. **Cambiar la contraseña inmediatamente en producción.**

---

## Variables de entorno

Copia `.env.local.example` a `.env.local`. Las variables mínimas para desarrollo son:

```bash
# .env — solo para Prisma CLI
DATABASE_URL="postgresql://..."

# .env.local — todo lo demás
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
UPLOADTHING_TOKEN="..."
PAYMENT_PROVIDER=mercadopago          # o 'mock' para simular sin credenciales
MERCADOPAGO_ACCESS_TOKEN=TEST-...
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-...
MERCADOPAGO_WEBHOOK_SECRET="..."
RESEND_API_KEY="..."                  # Bloque 11 — email transaccional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Ver `.env.local.example` para la lista completa incluyendo Wompi, Stripe y Analytics.

---

## Scripts disponibles

### Desarrollo

| Comando | Descripción |
|---|---|
| `yarn dev` | Servidor de desarrollo con Turbopack |
| `yarn dev:https` | Desarrollo con HTTPS local (útil para webhooks) |
| `yarn build` | Build de producción |
| `yarn start` | Servidor de producción |

### Calidad de código

| Comando | Descripción |
|---|---|
| `yarn validate` | TypeScript + ESLint + Prettier — ejecutar antes de cada commit |
| `yarn type-check` | Verificación de tipos sin compilar |
| `yarn lint` | ESLint |
| `yarn lint:fix` | ESLint con corrección automática |
| `yarn format` | Prettier sobre todo el proyecto |
| `yarn format:check` | Verificar formato sin modificar archivos |

### Verificación E2E

Scripts de verificación automatizados (requieren servidor corriendo en `localhost:3000`):

| Comando | Qué verifica |
|---|---|
| `yarn verify:payments` | Flujo completo de pagos: tarjeta aprobada/rechazada, PSE, webhook, idempotencia, monto manipulado (15 casos) |
| `yarn verify:account` | Registro, login, historial de pedidos, cambio de contraseña (7 casos) |
| `yarn verify:favorites` | Persistencia de favoritos y sincronización localStorage ↔ DB (2 casos) |
| `yarn verify:categories` | CRUD de categorías y actualización del storefront (6 casos) |
| `yarn verify:address` | Combobox de dirección: autodetección de país, encadenado de estados/ciudades |
| `yarn verify:admin-guard` | Protección del panel admin: acceso denegado a clientes y no autenticados |

---

## Base de datos

```bash
# Crear una nueva migración
yarn prisma migrate dev --name nombre-de-la-migracion

# Aplicar migraciones en producción
yarn prisma migrate deploy

# Poblar con datos de prueba
yarn prisma db seed

# Explorar la base de datos
yarn prisma studio
```

### Modelos principales

| Modelo | Descripción |
|---|---|
| `Role` | Roles con permisos granulares por módulo y acción |
| `User` | Usuarios con rol asignado (admin staff o customer) |
| `Product` | Catálogo con stock, variantes, imágenes y flags de publicación |
| `Category` | Categorías administrables con slug único, imagen y SEO |
| `Order` / `OrderItem` | Pedidos transaccionales con numeración secuencial |
| `PaymentLog` | Auditoría append-only de cada evento de pago |
| `Setting` | Configuración dinámica key/value (JSON) para todo lo administrable |
| `Favorite` | Favoritos por usuario (sincronización localStorage ↔ DB) |

---

## Pagos

La arquitectura de pagos es multi-proveedor. El proveedor activo se controla con la variable `PAYMENT_PROVIDER`:

```
PAYMENT_PROVIDER=mercadopago   # Producción Colombia
PAYMENT_PROVIDER=mock          # Desarrollo sin credenciales
# PAYMENT_PROVIDER=wompi       # Bloque 10.5 — próximamente
# PAYMENT_PROVIDER=stripe      # Bloque 10.6 — clientes internacionales
```

### Tarjetas de prueba (MercadoPago sandbox)

| Número | Red | Resultado según titular |
|---|---|---|
| `5254 1336 7440 3564` | Mastercard | `APRO` = aprobado, `FUND` = fondos insuf., `SECU` = CVV inválido |
| `4013 5406 8274 6260` | Visa crédito | CVV: `123` — Venc: `11/30` |
| `4915 1120 5524 6507` | Visa débito | CVV: `123` — Venc: `11/30` |

Ver [`docs/MERCADOPAGO-SETUP.md`](./docs/MERCADOPAGO-SETUP.md) para la guía completa de configuración sandbox y producción.

---

## Configuración del tema

El aspecto visual de la tienda es 100% administrable desde `/admin → Configuración → Tema`:

- **Colores**: paleta OKLCH con color pickers, presets incluidos y verificación de contraste WCAG AA
- **Tipografía**: ~65 Google Fonts con preview en la propia fuente, aplicadas al storefront en tiempo real
- **Logotipo y contenido del home**: gestionados vía UploadThing CDN

Los defaults viven en `src/config/store.config.ts` y `src/config/theme.config.ts`. Los valores guardados en la DB tienen prioridad y se aplican mediante ISR con `revalidateTag`.

---

## Documentación técnica

| Documento | Contenido |
|---|---|
| [`docs/ROADMAP.md`](./docs/ROADMAP.md) | Estado de todos los módulos, plan de ejecución por bloques y auditoría de mejoras pendientes (Bloque 14) |
| [`docs/STANDARDS.md`](./docs/STANDARDS.md) | Convenciones de código, SOLID, accesibilidad, seguridad y checklist de PR |
| [`docs/PROJECT.md`](./docs/PROJECT.md) | Visión de negocio, modelo y decisiones arquitectónicas |
| [`docs/MERCADOPAGO-SETUP.md`](./docs/MERCADOPAGO-SETUP.md) | Guía paso a paso para configurar MercadoPago en sandbox y producción |
| [`docs/FABLE5-PLAN.md`](./docs/FABLE5-PLAN.md) | Plan de ejecución con prompts listos para Claude Fable 5 |

---

## Seguridad

- **Pagos**: el monto siempre se lee de la DB, nunca del request del cliente. El estado `PAID` solo lo escribe el webhook handler tras verificar la firma HMAC-SHA256.
- **Admin**: todas las rutas `/api/admin/*` verifican sesión + permiso granular. El middleware protege `/admin/*` y `/cuenta/*`.
- **Webhooks**: `/api/payments/*` excluido del middleware de auth (llegan sin sesión, se autentican por firma).
- **Imágenes**: UploadThing con endpoints por permiso — la subida se aborta si el usuario no tiene el permiso correspondiente.
- **HTTP**: headers de seguridad configurados en `next.config.ts` (CSP, HSTS, X-Frame-Options, Referrer-Policy).
- **Contraseñas**: hash con bcryptjs. Mínimo 8 caracteres.
