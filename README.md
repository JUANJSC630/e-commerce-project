# Dulce Infancia — E-Commerce

Tienda en línea de ropa infantil para el mercado colombiano. Storefront público, panel de administración multi-rol y pagos reales con MercadoPago (tarjeta + PSE).

## Stack

|             |                                         |
| ----------- | --------------------------------------- |
| Framework   | Next.js 15.3.3 — App Router + Turbopack |
| Lenguaje    | TypeScript strict                       |
| Estilos     | Tailwind CSS v4 + OKLCH tokens          |
| Componentes | shadcn/ui                               |
| ORM / DB    | Prisma v7 + PostgreSQL                  |
| Auth        | NextAuth.js v4 (JWT)                    |
| Pagos       | MercadoPago Checkout API                |
| Imágenes    | UploadThing v7                          |
| Email       | Resend                                  |
| Deploy      | Vercel                                  |

## Arrancar el proyecto

```bash
yarn install

cp .env.local.example .env.local
# Completar .env.local y .env (DATABASE_URL va en .env para Prisma CLI)

yarn prisma migrate deploy
yarn prisma db seed

yarn dev
```

- Storefront: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

## Scripts útiles

```bash
yarn validate          # TypeScript + ESLint + Prettier (antes de cada commit)
yarn verify:payments   # E2E del flujo de pagos (15 casos)
yarn verify:account    # E2E de cuenta de cliente (7 casos)
yarn prisma studio     # Explorar la base de datos
```

## Documentación

|                                                            |                                             |
| ---------------------------------------------------------- | ------------------------------------------- |
| [`docs/ROADMAP.md`](./docs/ROADMAP.md)                     | Estado del proyecto y plan de ejecución     |
| [`docs/STANDARDS.md`](./docs/STANDARDS.md)                 | Convenciones de código y checklist de PR    |
| [`docs/MERCADOPAGO-SETUP.md`](./docs/MERCADOPAGO-SETUP.md) | Configuración de pagos sandbox y producción |
| [`docs/FABLE5-PLAN.md`](./docs/FABLE5-PLAN.md)             | Plan de mejoras con prompts para Fable 5    |
