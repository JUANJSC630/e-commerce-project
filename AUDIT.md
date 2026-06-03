# Audit — Dulce Infancia Shop
> Generado: 2026-06-03 | Score: 6/20 (Poor — Major Overhaul Needed)

---

## Resumen Ejecutivo

| # | Dimensión | Score | Hallazgo Principal |
|---|-----------|-------|-------------------|
| 1 | Accessibility | 1/4 | Sin nav móvil, touch targets de 10px, custom radio buttons sin roles ARIA |
| 2 | Performance | 1/4 | `priority={true}` en TODAS las imágenes, dual sistema de toasts |
| 3 | Responsive Design | 1/4 | Navegación completamente oculta en móvil sin alternativa |
| 4 | Theming | 2/4 | Colores de marca en hex hardcodeados fuera del sistema de tokens |
| 5 | Anti-Patterns | 1/4 | Montserrat + Inter (ambas en lista de rechazo), icon grid, hero genérico centrado |
| **Total** | | **6/20** | **Poor — Major Overhaul** |

**Issues por severidad**: 4×P0 · 6×P1 · 5×P2 · 3×P3

---

## Anti-Patterns: ¿Parece generado por IA?

**Sí, en varios puntos clave:**

1. **Tipografía monocultivo** — Montserrat + Inter. Ambas son las fuentes por defecto del modelo. Sin identidad.
2. **Icon grid de features** — 4 cards idénticas con icono + título + descripción (Envío Rápido, Empaque Especial…). Patrón más sobreutilizado de 2024.
3. **Hero centrado genérico** — Imagen de fondo, overlay semitransparente, título grande centrado, botón CTA. Podría ser cualquier tienda.
4. **Grilla de product cards uniforme** — Cards idénticas con imagen 3:4, estrellas, precio, botón. Sin variación de composición.
5. **Centrado total** — Casi todos los headings y secciones están en `text-center`. Nada está alineado a la izquierda.

---

## P0 — Bloqueantes (fix inmediato)

### 1. Sin navegación móvil
- **Archivo**: `src/app/layout.tsx:52`
- **Problema**: El `<nav>` está oculto con `hidden md:flex` y no hay hamburger, drawer ni alternativa alguna. En móvil, los usuarios solo ven logo + ícono de carrito. No pueden acceder a Bebés, Niñas, Niños, Ofertas ni Esenciales.
- **Estándar violado**: WCAG 2.4.1 — Bypass Blocks (A)
- **Fix**: Agregar botón hamburger que abra un `Sheet`/`Drawer` con los mismos links del nav.
- **Comando**: `/adapt`

### 2. `priority={true}` en TODOS los ProductCards
- **Archivo**: `src/components/product/product-card.tsx:54`
- **Problema**: Con 8-16 cards en pantalla, todas con `priority={true}`, el navegador intenta descargar todas las imágenes a máxima prioridad al mismo tiempo. Esto **degrada** el LCP en lugar de mejorarlo. Las imágenes below-the-fold deberían cargarse lazy.
- **Estándar violado**: Core Web Vitals — LCP
- **Fix**: Pasar `priority` como prop opcional al componente con default `false`. Solo activarlo para las primeras 2-4 cards visibles desde el padre.
- **Comando**: `/optimize`

### 3. Touch targets de 10px en banner dots
- **Archivo**: `src/app/page.tsx:136-145`
- **Código problemático**: `className="w-2.5 h-2.5"` → 10×10px CSS
- **Problema**: El mínimo requerido por WCAG y Apple HIG es 44×44px de área táctil. Son prácticamente intocables en móvil, especialmente para adultos mayores.
- **Estándar violado**: WCAG 2.5.5 — Target Size (AA)
- **Fix**: Mantener el punto visual pequeño pero envolver en `<button>` con padding suficiente (`p-3` o similar) para alcanzar 44×44px.
- **Comando**: `/adapt`

### 4. Skeleton permanente en "También te puede interesar"
- **Archivo**: `src/app/carrito/page.tsx:92-99`
- **Problema**: La sección muestra 4 skeleton loaders con `animate-pulse` que **nunca** se reemplazan con datos reales porque no hay lógica de fetch. El usuario ve una sección cargando infinitamente, degradando la credibilidad.
- **Fix**: Implementar la lógica real de productos relacionados, o eliminar completamente la sección hasta que esté lista.
- **Comando**: `/distill`

---

## P1 — Mayores (fix antes de release)

### 5. Dos sistemas de toast activos simultáneamente
- **Archivos**: `package.json` + `layout.tsx` (react-hot-toast) + `carrito/page.tsx` (sonner)
- **Problema**: Ambas librerías están en el bundle (~15KB extra). `<Toaster>` de react-hot-toast está en el layout global mientras `useSonner` se usa en el carrito. Inconsistencia de UX y peso innecesario.
- **Fix**: Elegir uno (sonner es más moderno). Migrar todos los toast al mismo sistema y eliminar la librería descartada.
- **Comando**: `/optimize`

### 6. Botón de favorito sin aria-label
- **Archivo**: `src/components/product/product-card.tsx:68-78`
- **Problema**: El botón del corazón contiene solo un ícono SVG. Para lectores de pantalla aparece como "button" sin nombre ni contexto.
- **Estándar violado**: WCAG 1.1.1 (A), 4.1.2 (A)
- **Fix**: Agregar `aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}`.
- **Comando**: `/adapt`

### 7. PaymentForm: radio buttons custom sin roles ARIA
- **Archivo**: `src/components/checkout/payment-form.tsx:263-297`
- **Problema**: Los métodos de pago son `<div>` clickeables simulando radio buttons. Sin `role="radio"`, `aria-checked`, ni `role="radiogroup"`. Usuarios de teclado y lectores de pantalla no pueden interactuar.
- **Estándar violado**: WCAG 4.1.2 — Name, Role, Value (A)
- **Fix**: Reemplazar con `<input type="radio">` nativos o agregar los roles ARIA correctos + navegación por teclado.
- **Comando**: `/adapt`

### 8. `window.location.href` en lugar de router de Next.js
- **Archivo**: `src/app/checkout-flow/page.tsx:195, 266`
- **Problema**: `window.location.href = '/'` causa recarga completa de página. Destruye el estado de React, fuerza re-descarga de assets, y rompe el modelo SPA de Next.js.
- **Fix**: `import { useRouter } from 'next/navigation'` → `router.push('/')`.
- **Comando**: `/optimize`

### 9. `window.confirm()` para vaciar carrito
- **Archivo**: `src/app/carrito/page.tsx:61`
- **Problema**: `window.confirm()` bloquea el hilo principal, no es estilizable, no es traducible, y es una mala práctica en React moderno.
- **Estándar violado**: WCAG 3.3.4 — Error Prevention (AA)
- **Fix**: Reemplazar con `AlertDialog` de shadcn/ui para confirmaciones destructivas.
- **Comando**: `/adapt`

### 10. Fuentes en lista de rechazo (Montserrat + Inter)
- **Archivos**: `src/app/layout.tsx:12-22`, `tailwind.config.ts:99-101`
- **Problema**: Ambas fuentes son las más sobreutilizadas del ecosistema Next.js/shadcn. No comunican "tierna, cálida, confiable" — son neutras hasta ser invisibles. La marca carece de identidad tipográfica.
- **Fix**: Reemplazar con una pareja que tenga personalidad. Candidatos para una tienda infantil cálida y confiable:
  - Display: **Baloo 2**, **Nunito**, **Quicksand**, o buscar en Google Fonts con términos "warm rounded friendly"
  - Cuerpo: **Atkinson Hyperlegible** (accesibilidad extrema), **Source Serif 4**, o **Lato** (la menos genérica de las sans neutras)
- **Comando**: `/typeset`

---

## P2 — Menores (fix en siguiente iteración)

### 11. Colores de marca hardcodeados en hex
- **Archivo**: `tailwind.config.ts:16-22`
- **Colores afectados**: `brand.charcoal (#2F2F2F)`, `brand.goldenYellow (#F1C40F)`, `brand.taupe`, `brand.silver`, `brand.offWhite`
- **Problema**: Estos valores hex no participan en el sistema de CSS variables. En dark mode, `text-brand-charcoal` seguirá siendo oscuro sobre fondo oscuro. Inconsistencia con el resto del sistema que usa oklch variables.
- **Fix**: Mover a `globals.css` como CSS variables oklch y referenciarlos en el `@theme` de Tailwind v4.
- **Comando**: `/colorize`

### 12. `console.log` en producción
- **Archivo**: `src/components/product/product-card.tsx:37, 86`
- **Problema**: Expone información interna en la consola del navegador del usuario final.
- **Fix**: Eliminar ambas líneas de `console.log`.

### 13. Estado `isHovered` causa re-renders en ProductCard
- **Archivo**: `src/components/product/product-card.tsx:33, 47, 80`
- **Problema**: Cada `onMouseEnter`/`onMouseLeave` dispara un re-render completo. Con 12+ cards en pantalla → 24+ re-renders por movimiento de mouse.
- **Fix**: Eliminar el estado `isHovered` y reemplazar las condiciones con clases `group-hover:` de Tailwind CSS puro.
- **Comando**: `/optimize`

### 14. Lógica de validación duplicada
- **Archivos**: `src/app/checkout-flow/page.tsx:65-103` y `src/components/checkout/payment-form.tsx:163-241`
- **Problema**: `validatePaymentData` existe en dos lugares con implementaciones distintas. El de `payment-form.tsx` incluye algoritmo de Luhn y validación por tipo de tarjeta; el de `checkout-flow/page.tsx` es simplista. Si se actualiza uno, el otro queda desincronizado.
- **Fix**: Mover la validación robusta a `src/lib/validation.ts` y usarla en ambos lugares.

### 15. Duplicación de declaración de fuentes
- **Archivos**: `src/lib/fonts.ts` (nunca importado) y `src/app/layout.tsx:12-22` (activo)
- **Problema**: Las fuentes se declaran en dos archivos. `fonts.ts` es un artifact sin usar que genera confusión.
- **Fix**: Eliminar `src/lib/fonts.ts`.

---

## P3 — Polish (cuando haya tiempo)

### 16. `<nav>` sin aria-label
- **Archivo**: `src/app/layout.tsx:52`
- **Fix**: Agregar `aria-label="Navegación principal"` al elemento `<nav>`.

### 17. Hero hardcodea la altura del header
- **Archivo**: `src/app/page.tsx:91`
- **Código problemático**: `h-[calc(100vh-80px)]`
- **Problema**: Si el header cambia de altura (móvil, banner de promoción, etc.) el hero quedará mal calculado.
- **Fix**: Usar `min-h-[calc(100dvh-var(--header-height,80px))]` con CSS variable o `100svh`.

### 18. Alt text inapropiado en imágenes decorativas del hero
- **Archivo**: `src/app/page.tsx:100-105`
- **Problema**: Las imágenes del hero son decorativas (el texto está en el overlay HTML). El alt text repite el título causando doble lectura para screen readers.
- **Estándar violado**: WCAG 1.1.1
- **Fix**: Cambiar a `alt=""` para que los lectores de pantalla las ignoren.

---

## Patrones Sistémicos

| Patrón | Archivos afectados | Impacto |
|--------|-------------------|---------|
| `priority={true}` en todo | product-card, page.tsx, category pages | Performance global |
| Colores de dos sistemas mezclados | 8+ componentes | Theming inconsistente |
| Centrado total sin composición | Todas las páginas | Anti-pattern de diseño |
| Validación duplicada en componentes | checkout-flow, payment-form | Mantenibilidad |
| Texto de error sin icono accesible | Solo firstName en ShippingForm tiene icono | Inconsistencia UX |

---

## Lo que está bien (mantener y replicar)

- **OKLCH en sistema de temas** — `globals.css` usa `oklch()` correctamente. Buena base para theming.
- **ShippingForm a11y** — Tiene `aria-invalid`, `aria-describedby`, validación en blur/change, scroll-to-error. El componente más accesible del proyecto.
- **Cart Context** — Arquitectura con Provider/Context limpia y extensible.
- **`sizes` prop en imágenes** — ProductCard usa `sizes="(max-width: 768px) 50vw, ..."` correcto para responsive images.
- **`SheetDescription` en MiniCart** — Conciencia de accesibilidad del Sheet de Radix.
- **Algoritmo de Luhn** — La validación de tarjetas en `payment-form.tsx` implementa Luhn correctamente.

---

## Plan de Acción (orden recomendado)

```
Semana 1 — P0s
  [ ] Fix nav móvil con hamburger + drawer       → /adapt
  [ ] Fix priority={true} en ProductCard         → /optimize
  [ ] Fix touch targets dots del banner           → /adapt
  [ ] Eliminar skeleton permanente en carrito    → /distill

Semana 2 — P1s críticos
  [ ] Unificar sistema de toast (elegir sonner)  → /optimize
  [ ] window.location.href → router.push         → /optimize
  [ ] window.confirm → AlertDialog               → /adapt
  [ ] ARIA en botón favorito y payment radios    → /adapt

Semana 2-3 — Identidad visual
  [ ] Nueva tipografía (reemplazar Montserrat)   → /typeset
  [ ] Migrar brand colors a CSS vars oklch       → /colorize

Semana 3 — P2s
  [ ] Eliminar isHovered state del ProductCard   → /optimize
  [ ] Extraer validación a src/lib/validation.ts
  [ ] Eliminar console.logs y fonts.ts
  [ ] Eliminar react-hot-toast del bundle

Semana 4+ — Rediseño completo
  [ ] Nueva dirección visual (ver .impeccable.md) → /impeccable craft
  [ ] Re-audit para medir mejora de score         → /audit
```

---

*Contexto de diseño completo en `.impeccable.md`*
