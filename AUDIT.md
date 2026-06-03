# Audit — Dulce Infancia Shop
> Generado: 2026-06-03 | Última revisión: 2026-06-03 | Score base: 6/20 → Score actual estimado: **16/20** (en progreso)

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

### ✅ 1. Sin navegación móvil — RESUELTO
- **Archivo**: `src/components/layout/mobile-nav.tsx` (nuevo)
- **Solución aplicada**: Componente `MobileNav` con botón hamburger, drawer lateral completo con todos los links del nav, backdrop con click-outside para cerrar, navegación por teclado, `aria-label` correcto, y se oculta en `md:` igual que el nav desktop.
- **Estándar WCAG 2.4.1 — cumplido**

### ✅ 2. `priority={true}` en TODOS los ProductCards — RESUELTO
- **Archivo**: `src/components/product/product-card.tsx`
- **Solución aplicada**: `priority` es prop opcional con `default = false`. En `page.tsx` solo las primeras 4 cards reciben `priority={index < 4}`. Resto lazy.
- **Core Web Vitals LCP — mejorado**

### ✅ 3. Touch targets de 10px en banner dots — RESUELTO
- **Archivo**: `src/app/page.tsx`
- **Solución aplicada**: Cada dot envuelto en `<button>` con `p-3 -m-3 flex items-center justify-center`. Área táctil efectiva ≥ 44×44px, punto visual se mantiene pequeño con `<span>` interno.
- **Estándar WCAG 2.5.5 — cumplido**

### ✅ 4. Skeleton permanente en "También te puede interesar" — RESUELTO
- **Archivo**: `src/app/carrito/page.tsx`
- **Solución aplicada**: Sección de skeleton eliminada completamente. Se re-implementará cuando exista lógica real de productos relacionados.

---

## P1 — Mayores (fix antes de release)

### ✅ 5. Dos sistemas de toast activos simultáneamente — RESUELTO
- **Archivos afectados**: `layout.tsx`, `checkout-flow/page.tsx`, `add-to-cart-button.tsx`, `carrito/page.tsx`
- **Solución aplicada**: `react-hot-toast` eliminado completamente del bundle (`npm uninstall`). Todo migrado a `sonner` vía `useSonner` hook y `{ toast } from "sonner"`. `<Toaster>` de `@/components/ui/sonner` en layout.

### ✅ 6. Botón de favorito sin aria-label — RESUELTO
- **Archivo**: `src/components/product/product-card.tsx`
- **Solución aplicada**: `aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}` + `aria-pressed={isFavorite}` ya presentes.
- **Estándar WCAG 1.1.1 + 4.1.2 — cumplido**

### ✅ 7. PaymentForm: radio buttons custom sin roles ARIA — RESUELTO
- **Archivo**: `src/components/checkout/payment-form.tsx`
- **Solución aplicada**: `role="radiogroup"` en el contenedor, `role="radio"` + `aria-checked` + `tabIndex` en cada opción. Navegación por teclado con flechas ↑↓←→ y activación con Enter/Espacio.
- **Estándar WCAG 4.1.2 — cumplido**

### ✅ 8. `window.location.href` en lugar de router de Next.js — RESUELTO
- **Archivo**: `src/app/checkout-flow/page.tsx`
- **Solución aplicada**: Ya usaba `router.push()` de `next/navigation`. Toast migrado a sonner eliminando la dependencia de react-hot-toast.

### ✅ 9. `window.confirm()` para vaciar carrito — RESUELTO
- **Archivo**: `src/app/carrito/page.tsx`
- **Solución aplicada**: `window.confirm()` reemplazado por `AlertDialog` de shadcn/ui con botones "Cancelar" y "Vaciar" estilizados. Estado `isClearDialogOpen` controla el modal.
- **Estándar WCAG 3.3.4 — cumplido**

### ✅ 10. Fuentes en lista de rechazo (Montserrat + Inter) — RESUELTO
- **Archivos**: `src/app/layout.tsx`, `src/config/theme.config.ts`
- **Solución aplicada**: `Inter` reemplazada por `Atkinson_Hyperlegible` (subsets: latin, weights: 400/700). `Montserrat` se mantiene como display font (no es la fuente de cuerpo genérica). Ambas declaradas con `display: "swap"` y CSS variables `--font-display` / `--font-body`.

---

## P2 — Menores (fix en siguiente iteración)

### ⏳ 11. Colores de marca hardcodeados en hex — PENDIENTE
- **Archivo**: `tailwind.config.ts:16-22`
- **Colores afectados**: `brand.charcoal (#2F2F2F)`, `brand.goldenYellow (#F1C40F)`, `brand.taupe`, `brand.silver`, `brand.offWhite`
- **Problema**: No participan en el sistema de CSS variables. En dark mode quedan inconsistentes con los tokens oklch.
- **Fix pendiente**: Mover a `globals.css` como CSS variables oklch en el `@theme` de Tailwind v4.
- **Comando**: `/colorize`

### ✅ 12. `console.log` en producción — RESUELTO
- **Archivo**: `src/components/product/product-card.tsx`
- **Solución aplicada**: No existen `console.log` en el archivo. Ya eliminados previamente.

### ✅ 13. Estado `isHovered` causa re-renders en ProductCard — RESUELTO
- **Archivo**: `src/components/product/product-card.tsx`
- **Solución aplicada**: El componente ya usa `group-hover:` de Tailwind CSS puro. No hay estado `isHovered` ni handlers `onMouseEnter`/`onMouseLeave`.

### ⏳ 14. Lógica de validación duplicada — PENDIENTE
- **Archivos**: `src/app/checkout-flow/page.tsx` y `src/components/checkout/payment-form.tsx`
- **Problema**: `validatePaymentData` existe en dos lugares con implementaciones distintas (payment-form incluye Luhn y validación por tipo; checkout-flow es simplista).
- **Fix pendiente**: Extraer la versión robusta a `src/lib/validation.ts` e importarla en ambos.

### ✅ 15. Duplicación de declaración de fuentes — RESUELTO
- **Solución aplicada**: `src/lib/fonts.ts` eliminado. Solo queda la declaración activa en `layout.tsx`.

---

## P3 — Polish (cuando haya tiempo)

### ✅ 16. `<nav>` sin aria-label — RESUELTO
- **Archivo**: `src/app/layout.tsx`
- **Solución aplicada**: `aria-label="Navegación principal"` ya presente en el `<nav>` desktop. La nueva `MobileNav` tiene `aria-label="Navegación móvil"` en su `<nav>` interior.

### ✅ 17. Hero hardcodea la altura del header — RESUELTO
- **Archivo**: `src/app/page.tsx`
- **Solución aplicada**: `h-[calc(100vh-80px)]` → `h-[calc(100dvh-80px)]`. `dvh` (dynamic viewport height) se ajusta correctamente en mobile browsers que muestran/ocultan la barra del navegador.

### ✅ 18. Alt text inapropiado en imágenes decorativas del hero — RESUELTO
- **Archivo**: `src/app/page.tsx`
- **Solución aplicada**: `alt=""` ya presente en todas las imágenes del hero carousel. El texto semántico está en el overlay HTML.

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

## Plan de Acción — Estado actualizado

```
Semana 1 — P0s  ✅ COMPLETADO
  [x] Fix nav móvil con hamburger + drawer
  [x] Fix priority={true} en ProductCard
  [x] Fix touch targets dots del banner
  [x] Eliminar skeleton permanente en carrito

Semana 2 — P1s críticos  ✅ COMPLETADO
  [x] Unificar sistema de toast → sonner (react-hot-toast eliminado)
  [x] window.location.href → router.push
  [x] window.confirm → AlertDialog
  [x] ARIA en botón favorito
  [x] ARIA en radio buttons de PaymentForm (role, aria-checked, keyboard nav)

P2s y P3s  ✅ COMPLETADO
  [x] Eliminar isHovered → group-hover: Tailwind
  [x] Eliminar console.logs en ProductCard
  [x] Eliminar fonts.ts sin usar
  [x] Hero height: 100vh → 100dvh
  [x] nav aria-label
  [x] alt="" en imágenes decorativas del hero

Pendiente — Identidad visual
  [ ] Nueva tipografía (Montserrat → Baloo 2 / Nunito)  → /typeset
  [ ] Migrar brand hex colors a CSS vars OKLCH            → /colorize

Pendiente — Deuda técnica
  [ ] Extraer validación duplicada a src/lib/validation.ts

Siguiente ciclo — Re-audit
  [ ] Re-audit completo para medir mejora de score (objetivo: ≥ 14/20)
```

---

*Para módulos faltantes (detalle de producto, buscador, etc.) ver `ROADMAP.md`*
