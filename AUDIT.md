# Audit — Dulce Infancia Shop

> Última revisión: 2026-06-03 | Score actual: **18/20**
> Solo se documentan issues **pendientes**. Todo lo resuelto fue eliminado de este archivo.

---

## Resumen Ejecutivo

| #         | Dimensión                        | Score     | Hallazgo Principal                                                      |
| --------- | -------------------------------- | --------- | ----------------------------------------------------------------------- |
| 1         | Accessibility                    | 4/4       | Sin issues pendientes                                                   |
| 2         | Performance + Seguridad de Pago  | 4/4       | Sin issues pendientes                                                   |
| 3         | Responsive Design                | 4/4       | Sin issues pendientes                                                   |
| 4         | Theming + Identidad Visual       | 2/4       | Hero genérico, icon grid, centrado total — decisión de paleta pendiente |
| 5         | Arquitectura + Calidad de Código | 4/4       | Sin issues pendientes                                                   |
| **Total** |                                  | **18/20** |                                                                         |

**Issues pendientes**: 0×P0 · 0×P1 · 0×P2 · 2×P3

---

## P3 — Identidad Visual (requiere decisión de marca primero)

### 1. Hero genérico — podría ser cualquier tienda

- **Archivo**: `src/app/page.tsx`
- **Problema**: Imagen de fondo, overlay semitransparente oscuro, título grande centrado, subtítulo centrado, botón CTA centrado. Es el patrón hero más replicado en plantillas de 2023–2024. No comunica ternura, infancia ni Colombia. Podría ser una tienda de tecnología, fitness o turismo con los mismos estilos.
- **Bloqueo**: Necesita decisión final de paleta (crema/beige, terracota o durazno) antes de rediseñar. Sin esa decisión, cualquier cambio visual puede necesitar rehacerse.
- **Dirección** (según `.impeccable.md`): Composición asimétrica, texto alineado a la izquierda, producto como protagonista, sin overlay que oscurezca colores. Fondo crema/beige, no fotografía oscurecida.

### 2. Sección de features — icon grid genérico

- **Archivo**: `src/app/page.tsx`
- **Problema**: 4 cards idénticas con icono centrado + título + descripción. "Envío Rápido", "Empaque Especial", "Pago Seguro", "Calidad Garantizada". Anti-patrón número 1 de diseño AI, señalado explícitamente en `.impeccable.md`.
- **Bloqueo**: Igual que el hero — necesita decisión visual comprometida primero.
- **Dirección**: Banda horizontal con texto corrido, estadísticas con tipografía grande, o promesa de marca con fotografía real. Sin icon grid.

---

## Decisiones de Identidad Visual Pendientes

Estas no son tareas técnicas. Son decisiones que deben tomarse antes de ejecutar cualquier cambio visual, porque sin ellas todo puede necesitar rehacerse:

| Decisión                 | Opciones                                                                  | Impacto                         |
| ------------------------ | ------------------------------------------------------------------------- | ------------------------------- |
| **Tipografía display**   | Baloo 2, Nunito (cálidas y redondeadas) vs. Montserrat (genérica, actual) | Personalidad de la marca entera |
| **Color de acento**      | Terracota, durazno, verde salvia, mostaza envejecida                      | Botones, badges, highlights     |
| **Paleta de superficie** | Crema tostada, beige, blanco roto (nunca blanco puro)                     | Fondos, cards, secciones        |
| **Modo inicial**         | Solo modo claro (recomendado) vs. dark mode desde Fase 0                  | Complejidad de tokens y testing |

---

## Lo que está bien — mantener y replicar

- **OKLCH token system** — `globals.css` + `tailwind.config.ts` conectados correctamente. Cambiar el tema = cambiar 6 variables en `theme.config.ts` + `globals.css`.
- **Cart Context + Provider** — Arquitectura limpia, localStorage correcto, extensible. Modelo para replicar en Favorites.
- **`useFavorites` hook** — Persistencia en localStorage por ID de producto. Patrón correcto, sin Context innecesario.
- **`src/lib/validation.ts`** — Una sola fuente de verdad para validación: Luhn, tipo de tarjeta, shipping, payment. Importado en checkout y payment-form.
- **ShippingForm a11y** — `aria-invalid`, `aria-describedby`, validación en blur/change, scroll-to-error. El componente más accesible del proyecto. Replicar en futuros formularios.
- **`sizes` prop en imágenes** — ProductCard usa `sizes="(max-width: 768px) 50vw, ..."`. Correcto para Core Web Vitals.
- **Footer conectado a config** — Redes sociales y email se leen de `store.config.ts`. Solo aparecen si tienen valor. White-label restaurado.
- **Catálogo unificado** — 17 productos en `allMockProducts`, IDs consistentes (`baby-001`, `girls-001`, etc.). Un solo array, una sola función `getProductById`.
- **TypeScript estricto sin errores** — `tsc --noEmit` pasa limpio. Mantener en cada PR.
- **Pipeline `yarn validate`** — `type-check + lint + format:check` en un comando. Ejecutar antes de cada commit.
- **Checkout production-safe** — `isSubmitting` guard en `handleOrderConfirm` previene doble cobro.
- **`not-found.tsx` + `error.tsx`** — Páginas de error con branding, CTAs de recuperación y links de navegación.
- **`.env.local.example`** — Todas las variables futuras documentadas con secciones por servicio.

---

## Plan de Acción — Solo pendientes

### Requiere decisión de identidad visual primero

```
[ ] Commit tipografía display (Baloo 2 o Nunito — reemplazar Montserrat)  → /typeset
[ ] Commit paleta final (acento terracota/durazno, superficie crema/beige) → /colorize
[ ] Rediseñar hero — composición asimétrica, sin overlay genérico           → después de paleta
[ ] Reemplazar icon grid por sección con personalidad de marca              → después de paleta
```

### Siguiente ciclo de features (ver ROADMAP.md)

```
[ ] Buscador /search (header + página de resultados)
[ ] Filtros en páginas de categoría (precio, talla, color)
[ ] Página /favoritos (el hook ya existe, falta la página)
[ ] Banner de promoción en header
[ ] generateMetadata() por página
[ ] sitemap.ts + robots.txt
[ ] Re-audit completo (objetivo: 20/20)
```

---

_Para módulos faltantes y plan de fases ver `ROADMAP.md`. Para visión de negocio y stack ver `PROJECT.md`._
