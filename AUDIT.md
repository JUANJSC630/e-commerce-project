# Audit — Dulce Infancia Shop

> Generado: 2026-06-03 | Score actual: **13/20** (subió de 6/20 — trabajo previo completado)
> Solo se documentan issues **pendientes**. Todo lo resuelto fue eliminado de este archivo.

---

## Resumen Ejecutivo

| #         | Dimensión                        | Score     | Hallazgo Principal                                       |
| --------- | -------------------------------- | --------- | -------------------------------------------------------- |
| 1         | Accessibility                    | 3/4       | Favoritos con estado efímero, sin persistencia           |
| 2         | Performance + Seguridad de Pago  | 2/4       | Checkout sin prevención de doble envío                   |
| 3         | Responsive Design                | 4/4       | Sin issues pendientes                                    |
| 4         | Theming + Identidad Visual       | 2/4       | Hero genérico, icon grid, centrado total, aliases legacy |
| 5         | Arquitectura + Calidad de Código | 2/4       | Dos catálogos duplicados, footer desconectado del config |
| **Total** |                                  | **13/20** |                                                          |

**Issues por severidad**: 2×P0 · 2×P1 · 6×P2 · 2×P3

---

## P0 — Bloqueantes (rompen la promesa del proyecto)

### 1. Dos catálogos de productos activos simultáneamente

- **Archivos**: `src/lib/mock-data.ts:189` y `src/lib/mock-data.ts:198`
- **Problema**: Existen dos arrays: `allMockProducts` (13 productos, IDs tipo `baby-001`) y `mockProducts` legacy (4 productos, IDs `"1"`, `"2"`, `"3"`, `"4"`). La función `getProductById()` busca primero en `allMockProducts` y si no encuentra, busca en `mockProducts`. Las rutas dinámicas `/products/[id]` son inconsistentes — el ID `"1"` resuelve al producto legacy, `baby-001` al nuevo. Cuando se integre un CMS o backend real, esta duplicidad generará bugs de resolución silenciosos imposibles de rastrear.
- **Fix**: Eliminar `mockProducts` completamente. Mover los 4 productos legacy a `allMockProducts` con IDs normalizados (`"1"` → `"legacy-001"` o simplemente integrar con los 13 existentes). Limpiar `getProductById` para buscar en un solo array.

### 2. Footer hardcodea datos que deberían venir de `store.config.ts`

- **Archivo**: `src/components/layout/footer.tsx:28,37,46,108,140,143`
- **Problema**: El footer tiene hardcodeados valores que contradicen directamente la arquitectura white-label del proyecto:
  - `href="https://instagram.com"` — en lugar de leer `social.instagram`
  - `href="https://facebook.com"` — en lugar de leer `social.facebook`
  - `href="https://twitter.com"` — en lugar de leer `social.twitter`
  - `href="mailto:contacto@dulceinfancia.co"` (aparece 2 veces) — en lugar de leer `contact.email`
  - `contacto@dulceinfancia.co` como texto visible — hardcodeado
- **Consecuencia directa**: `store.config.ts` tiene `social.instagram = ""` y `contact.email = ""`. Cuando el cliente llene esos campos, el footer no se actualizará. La promesa central del white-label — "cambiar 2 archivos para clonar la tienda" — está rota.
- **Fix**: Importar `{ social, contact }` desde `store.config.ts` en `footer.tsx`. Mostrar links de redes sociales solo si el valor no está vacío (`social.instagram && <a href={social.instagram}>`). Reemplazar el email hardcodeado con `contact.email`.

---

## P1 — Mayores (bloquean producción real)

### 3. Checkout sin prevención de doble envío

- **Archivo**: `src/app/checkout-flow/page.tsx:175-197`
- **Problema**: `handleOrderConfirm()` no tiene estado `isSubmitting`. Si el usuario hace clic dos veces en "Confirmar pedido" (doble clic accidental, conexión lenta, impaciencia), se ejecutan múltiples llamadas a `clearCart()` y `router.push()`. Con mock-data esto es inofensivo. Con una pasarela de pago real (MercadoPago, Stripe), genera **cobros duplicados**. Es el tipo de bug que no aparece en desarrollo y destruye la confianza del cliente en producción.
- **Fix**: Agregar `const [isSubmitting, setIsSubmitting] = useState(false)` al componente. En `handleOrderConfirm`: hacer `setIsSubmitting(true)` al inicio, deshabilitar el botón con `disabled={isSubmitting}`, y hacer `setIsSubmitting(false)` en el bloque de error.

### 4. Estado de favoritos efímero — botón que no sirve de nada

- **Archivo**: `src/components/product/product-card.tsx:34`
- **Problema**: `const [isFavorite, setIsFavorite] = useState(false)`. El estado se resetea cada vez que el componente se desmonta (navegar a otra página, scroll que desmonta cards con virtualización futura, etc.). El usuario hace clic en el corazón, ve que se pone rojo, navega a otra categoría y vuelve — el corazón está vacío de nuevo. Un botón que no persiste su estado es peor que no tener el botón: genera frustración activa. El ARIA (`aria-pressed`) también reporta un estado incorrecto al recargar.
- **Fix**: Implementar un `FavoritesContext` con `localStorage` (igual que el `CartProvider`), o como mínimo guardar los IDs favoritos en `localStorage` directamente dentro del hook del botón. La estructura del carrito es un modelo perfecto para replicar.

---

## P2 — Técnicos (deuda que crece)

### 5. Lógica de validación duplicada con implementaciones distintas

- **Archivos**: `src/app/checkout-flow/page.tsx:58-97` y `src/components/checkout/payment-form.tsx`
- **Problema**: `validatePaymentData` existe en dos archivos con implementaciones diferentes. La versión en `payment-form.tsx` incluye el algoritmo de Luhn y validación específica por tipo de tarjeta. La versión en `checkout-flow/page.tsx` solo valida formato básico de 16 dígitos y no aplica Luhn. Cuando se corrija un edge-case en uno, el otro queda desincronizado. Ya ha pasado — las dos implementaciones divergen hoy mismo.
- **Fix**: Crear `src/lib/validation.ts` con las funciones `validateShippingData` y `validatePaymentData` (usando la versión robusta con Luhn de `payment-form.tsx`). Importar en ambos archivos. Eliminar las definiciones duplicadas.

### 6. Aliases de color legacy sin migrar en componentes

- **Archivo**: `tailwind.config.ts:30-35`
- **Problema**: Los aliases `brand.charcoal`, `brand.offWhite`, `brand.silver`, `brand.taupe`, `brand.goldenYellow` ya apuntan a CSS variables OKLCH (esto es correcto). Pero el comentario en el config dice "Legacy aliases — kept for backward compat while migrating components", lo que confirma que hay componentes usando `text-brand-charcoal`, `bg-brand-goldenYellow`, etc. Estas clases son semánticamente incorrectas — `charcoal` no describe el rol del color, describe el valor. En el futuro, cuando cambie el valor de `--brand-ink`, los componentes que usen `brand-ink` cambiarán correctamente pero los que usen `brand-charcoal` harán lo mismo sin que el desarrollador lo sepa, generando confusión.
- **Fix**: Hacer un `grep -r "brand-charcoal\|brand-goldenYellow\|brand-offWhite\|brand-silver\|brand-taupe"` en `src/`. Reemplazar cada instancia con su alias semántico (`brand-ink`, `brand-base`, `brand-surface`, `brand-surface-alt`, `brand-muted`). Eliminar los aliases legacy del config.

### 7. Sin páginas de error ni 404 con branding

- **Archivos faltantes**: `src/app/not-found.tsx`, `src/app/error.tsx`
- **Problema**: Cualquier URL inválida muestra la página 404 genérica de Next.js. Cualquier error de runtime no capturado muestra la página de error genérica de Next.js (o pantalla en blanco en producción). Desde la perspectiva del usuario, la tienda "se rompe" y no tiene aspecto de marca profesional. Desde la perspectiva técnica, no hay forma de loguear errores o mostrar un CTA de recuperación.
- **Fix**: Crear `src/app/not-found.tsx` con el header de la tienda, mensaje amigable y links de vuelta a home y categorías. Crear `src/app/error.tsx` con `"use client"` y un botón "Intentar de nuevo" que llame a `reset()`.

### 8. Sin `.env.local.example`

- **Problema**: El proyecto no tiene ningún archivo de variables de entorno documentado. Cuando se integren MercadoPago (`MERCADOPAGO_ACCESS_TOKEN`, `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`), Google Analytics (`NEXT_PUBLIC_GA_ID`), Meta Pixel (`NEXT_PUBLIC_META_PIXEL_ID`), Sanity CMS (`NEXT_PUBLIC_SANITY_PROJECT_ID`), o cualquier otro servicio, no habrá documentación de qué variables son necesarias. El siguiente desarrollador (o el mismo en 3 meses) tendrá que leer el código fuente para descubrir qué necesita configurar.
- **Fix**: Crear `.env.local.example` ahora, vacío pero con las secciones comentadas para cada servicio planificado. Agregar `.env.local` al `.gitignore` si no está ya.

### 9. `README.md` es el template de `create-next-app`

- **Archivo**: `README.md`
- **Problema**: El README menciona "Geist font", comandos de `pnpm`/`bun`/`npm`, y el link genérico de deploy de Vercel. Cualquier persona que clone el repositorio (colaborador, cliente, inversor) recibe información incorrecta sobre el proyecto. El proyecto usa Yarn, Atkinson Hyperlegible, y tiene una arquitectura documentada en `PROJECT.md` y `ROADMAP.md`.
- **Fix**: Reescribir con: nombre del proyecto, descripción breve, stack real (Next.js 15, Tailwind v4, shadcn/ui, TypeScript), comandos con yarn, links a PROJECT.md y ROADMAP.md, y estructura básica del proyecto.

### 10. `PROJECT.md` documenta Next.js 14 — el proyecto corre 15.3.3

- **Archivo**: `PROJECT.md` — tabla de stack tecnológico
- **Problema**: `PROJECT.md` lista "Next.js 14 (App Router)" en la tabla de stack. El proyecto corre Next.js 15.3.3 con Turbopack. Esta inconsistencia confunde cuando se toman decisiones basadas en el documento (features disponibles, breaking changes, compatibilidad de librerías).
- **Fix**: Actualizar la tabla a "Next.js 15.3.3 (App Router + Turbopack)".

---

## P3 — Identidad Visual (el proyecto parece generado por IA)

### 11. Hero genérico — podría ser cualquier tienda

- **Archivo**: `src/app/page.tsx`
- **Problema**: Imagen de fondo, overlay semitransparente oscuro, título grande centrado, subtítulo centrado, botón CTA centrado. Este es el patrón hero más replicado en plantillas de 2023-2024. No comunica ternura, no comunica infancia, no comunica Colombia. Podría ser una tienda de tecnología, fitness o turismo con los mismos estilos.
- **Dirección correcta** (según `.impeccable.md`): Composición asimétrica, texto alineado a la izquierda, imagen del producto como protagonista (no de fondo), sin overlay que mate los colores. El fondo debe ser crema/beige, no una fotografía oscurecida.

### 12. Sección de features — icon grid genérico

- **Archivo**: `src/app/page.tsx` (sección "Por qué elegirnos" o similar)
- **Problema**: 4 cards idénticas, cada una con: icono centrado, título centrado, descripción centrada. "Envío Rápido", "Empaque Especial", "Pago Seguro", "Calidad Garantizada". Es el anti-patrón número 1 de diseño AI. No diferencia a Dulce Infancia de ninguna otra tienda. El `.impeccable.md` lo señala explícitamente como referencia negativa.
- **Dirección correcta**: Reemplazar con una sección que tenga personalidad propia — podría ser una banda horizontal con texto corrido, estadísticas con tipografía grande, o una promesa de marca con foto real. Sin icon grid.

---

## Patrones Sistémicos Pendientes

| Patrón                                     | Archivos afectados                           | Impacto                    |
| ------------------------------------------ | -------------------------------------------- | -------------------------- |
| Dos fuentes de verdad para productos       | `mock-data.ts`, `products/[id]/page.tsx`     | Bugs en rutas dinámicas    |
| Datos de marca hardcodeados en componentes | `footer.tsx`                                 | Rompe white-label          |
| Validación duplicada con divergencia       | `checkout-flow/page.tsx`, `payment-form.tsx` | Bugs silenciosos post-pago |
| Centrado total en headings y secciones     | Todas las páginas                            | Anti-pattern de diseño     |
| Estado de UI sin persistencia              | `product-card.tsx` (favoritos)               | Frustración de usuario     |

---

## Lo que está bien — mantener y replicar

- **OKLCH token system** — `globals.css` + `tailwind.config.ts` correctamente conectados. Cambiar el tema = cambiar 6 variables.
- **Cart Context + Provider** — Arquitectura limpia, localStorage correcto, extensible.
- **Algoritmo de Luhn** — Implementado correctamente en `payment-form.tsx`. Usar esta versión como canónica al extraer `validation.ts`.
- **ShippingForm accesibilidad** — `aria-invalid`, `aria-describedby`, validación en blur/change, scroll-to-error. El componente más accesible del proyecto. Replicar este patrón en otros formularios.
- **`sizes` prop en imágenes** — ProductCard usa `sizes="(max-width: 768px) 50vw, ..."`. Correcto para Core Web Vitals.
- **`store.config.ts` como fuente de verdad** — Excelente arquitectura. El problema es que `footer.tsx` no la usa. La solución es conectar, no cambiar la arquitectura.
- **TypeScript estricto sin errores** — `tsc --noEmit` pasa limpio. Mantener este estado en cada PR.
- **Pipeline `yarn validate`** — `type-check + lint + format:check` en un comando. Ejecutar antes de cada commit.

---

## Plan de Acción — Solo pendientes

### Bloque inmediato (no requiere decisiones externas)

```
[ ] P0-1: Unificar catálogos → eliminar mockProducts, normalizar IDs
[ ] P0-2: Conectar footer a store.config.ts (social.*, contact.*)
[ ] P1-3: Agregar isSubmitting al handleOrderConfirm en checkout
[ ] P1-4: Implementar FavoritesContext con localStorage
[ ] P2-5: Extraer validation.ts con la versión Luhn de payment-form
[ ] P2-6: Migrar brand-charcoal/goldenYellow/etc. a aliases semánticos
[ ] P2-7: Crear not-found.tsx y error.tsx con branding
[ ] P2-8: Crear .env.local.example con secciones comentadas
[ ] P2-9: Reescribir README.md con info real del proyecto
[ ] P2-10: Actualizar stack en PROJECT.md (Next.js 14 → 15.3.3)
```

### Requiere decisión de identidad visual primero

```
[ ] P3-11: Rediseñar hero — composición asimétrica, sin overlay genérico
[ ] P3-12: Reemplazar icon grid por sección con personalidad de marca
[ ] Commit tipografía final (display font: Baloo 2 o Nunito — Montserrat sigue siendo genérico)
[ ] Commit paleta final (acento: terracota o durazno, fondos: crema/beige)
```

### Siguiente ciclo de features (ver ROADMAP.md)

```
[ ] Buscador /search
[ ] Filtros en páginas de categoría
[ ] Banner de promoción en header
[ ] generateMetadata() por página
[ ] sitemap.ts + robots.txt
[ ] Re-audit completo (objetivo: ≥ 17/20)
```

---

_Para módulos faltantes y plan de fases ver `ROADMAP.md`. Para visión de negocio y stack ver `PROJECT.md`._
