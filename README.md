# Dulce Infancia — E-Commerce

Tienda en línea de ropa infantil para el mercado hispanohablante. Construida con Next.js 15, Tailwind CSS v4 y shadcn/ui.

## Stack

| Capa            | Tecnología                              |
| --------------- | --------------------------------------- |
| Framework       | Next.js 15.3.3 (App Router + Turbopack) |
| Lenguaje        | TypeScript (strict)                     |
| Estilos         | Tailwind CSS v4 + OKLCH tokens          |
| Componentes     | shadcn/ui (Radix UI)                    |
| Estado          | React Context (carrito, favoritos)      |
| Notificaciones  | Sonner                                  |
| Deploy objetivo | Vercel                                  |

## Primeros pasos

```bash
# Instalar dependencias
yarn install

# Desarrollo
yarn dev

# Verificación completa (TypeScript + ESLint + Prettier)
yarn validate
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Scripts disponibles

| Comando             | Descripción                                              |
| ------------------- | -------------------------------------------------------- |
| `yarn dev`          | Servidor de desarrollo con Turbopack                     |
| `yarn build`        | Build de producción                                      |
| `yarn start`        | Servidor de producción                                   |
| `yarn lint`         | Revisar errores de ESLint                                |
| `yarn lint:fix`     | Corregir errores de ESLint automáticamente               |
| `yarn format`       | Aplicar Prettier a todo el proyecto                      |
| `yarn format:check` | Verificar formato sin modificar archivos                 |
| `yarn type-check`   | TypeScript sin compilar                                  |
| `yarn validate`     | type-check + lint + format:check (usar antes de cada PR) |

## Variables de entorno

Copia `.env.local.example` a `.env.local` y completa los valores:

```bash
cp .env.local.example .env.local
```

## Configuración de marca

Gran parte de la tienda es **administrable desde `/admin`** sin tocar código:
productos, categorías, pedidos, usuarios, roles y la sección de Configuración.

Los valores por defecto y la config estructural viven en:

- `src/config/store.config.ts` — marca, rutas, nav especial, pagos, SEO base, contenido del home
- `src/config/theme.config.ts` — paleta OKLCH y tipografía (defaults)

> Nota: algunas secciones del editor de Configuración todavía no se aplican al
> storefront (se leen del config estático). Ver el audit de hardcoded en
> [`docs/ROADMAP.md`](./docs/ROADMAP.md).

## Documentación

Toda la documentación vive en [`docs/`](./docs):

- [`docs/STANDARDS.md`](./docs/STANDARDS.md) — **Leer antes de cada commit.** SOLID, accesibilidad, seguridad, patrones y checklist de PR
- [`docs/PROJECT.md`](./docs/PROJECT.md) — Visión, modelo de negocio y arquitectura
- [`docs/ROADMAP.md`](./docs/ROADMAP.md) — Estado de módulos, plan de ejecución y audit de hardcoded
