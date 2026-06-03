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

Toda la configuración de la tienda está centralizada en dos archivos:

- `src/config/store.config.ts` — nombre, rutas, nav, categorías, pagos, redes sociales, contacto
- `src/config/theme.config.ts` — paleta de colores OKLCH y tipografía

Para clonar el proyecto para otra marca: actualizar solo esos dos archivos.

## Documentación

- [`STANDARDS.md`](./STANDARDS.md) — **Leer antes de cada commit.** SOLID, accesibilidad, seguridad, patrones obligatorios y checklist de PR
- [`PROJECT.md`](./PROJECT.md) — Visión, modelo de negocio, KPIs y fases del proyecto
- [`ROADMAP.md`](./ROADMAP.md) — Estado de módulos y plan de ejecución (score 20/20)
- [`AUDIT.md`](./AUDIT.md) — Auditoría técnica: accesibilidad, performance, arquitectura
