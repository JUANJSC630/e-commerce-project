# Standards — Dulce Infancia Shop

> Documento de referencia obligatoria. Verificar contra esta lista antes de cada commit.
> Si un cambio no cumple un estándar, se corrige antes de mergear — sin excepciones.

---

## 1. Principios SOLID

### S — Single Responsibility

Cada archivo tiene una sola razón para cambiar.

| ✅ Correcto                                             | ❌ Incorrecto                                            |
| ------------------------------------------------------- | -------------------------------------------------------- |
| `hero-section.tsx` solo maneja el hero                  | `page.tsx` con hero + trust bar + categorías + productos |
| `validation.ts` solo contiene funciones de validación   | Validación inline dentro de un componente de UI          |
| `use-favorites.ts` solo gestiona el estado de favoritos | Hook que también hace fetch y formatea precios           |

**Regla práctica**: Si describes lo que hace un archivo y usas "y también", hay que dividirlo.

### O — Open/Closed

El código se extiende sin modificar los existentes.

| ✅ Correcto                                                                                   | ❌ Incorrecto                                            |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Agregar un nuevo método de pago en `store.config.ts` → aparece en el checkout automáticamente | Editar `payment-form.tsx` para agregar un método de pago |
| Agregar una categoría en `store.config.ts` → aparece en la navegación y el footer             | Editar `layout.tsx` para agregar un link de categoría    |
| `homePageContent` en config — copy cambia sin tocar TSX                                       | Strings hardcodeados en JSX                              |

**Regla práctica**: Si cambiar texto de UI requiere editar un `.tsx`, algo está hardcodeado.

### L — Liskov Substitution

Los componentes que reciben `Product` funcionan con cualquier `Product` válido.

**Regla práctica**: Un componente no debe fallar silenciosamente si recibe datos válidos del tipo declarado. Los guards van en el type, no en el componente.

### I — Interface Segregation

Las props solo incluyen lo que el componente realmente usa.

| ✅ Correcto                                 | ❌ Incorrecto                                                 |
| ------------------------------------------- | ------------------------------------------------------------- |
| `TrustBar` recibe `features: FeatureItem[]` | `TrustBar` recibe el objeto `store.config` completo           |
| `ProductCard` recibe `product: Product`     | `ProductCard` recibe un objeto con 20 campos de los que usa 8 |

**Regla práctica**: Si el componente ignora más de 2 props de un objeto que se le pasa, pasar solo las que usa.

### D — Dependency Inversion

Los componentes dependen de abstracciones (interfaces/types), no de implementaciones.

| ✅ Correcto                                      | ❌ Incorrecto                                             |
| ------------------------------------------------ | --------------------------------------------------------- |
| `FeaturedProducts` recibe `products: Product[]`  | `FeaturedProducts` importa `allMockProducts` directamente |
| `page.tsx` llama `getFeaturedProducts(limit)`    | `page.tsx` llama `allMockProducts.slice(0, 8)`            |
| `formatPrice(amount)` usando `locale` del config | `price.toLocaleString()` sin locale                       |

**Regla práctica**: Las páginas no llaman arrays directamente. Usan funciones con nombre semántico.

---

## 2. Arquitectura de Componentes

### Jerarquía obligatoria

```
Server Component (página)
  └── Server Component (sección)
        └── Client Component ("use client" solo si necesita estado/efectos)
```

Un componente solo lleva `"use client"` si usa: `useState`, `useEffect`, `useRef`, event handlers del DOM, o APIs del browser (`localStorage`, `window`). Todo lo demás es Server Component por defecto.

### Reglas de extracción

| Condición                                                    | Acción                     |
| ------------------------------------------------------------ | -------------------------- |
| Un bloque JSX se repite 2+ veces con el mismo propósito      | Extraer a componente       |
| Un archivo supera ~150 líneas de JSX                         | Revisar si puede dividirse |
| Una función de más de 15 líneas vive dentro de un componente | Moverla a `lib/`           |
| Un hook maneja más de un concepto de dominio                 | Dividir en hooks separados |

### Estructura de carpetas

```
src/components/
  home/           ← Componentes exclusivos de la homepage
  cart/           ← Componentes del sistema de carrito
  checkout/       ← Pasos del checkout
  layout/         ← Header, footer, nav
  product/        ← Componentes de producto (reutilizables entre páginas)
  ui/             ← shadcn/ui — NO modificar directamente

src/lib/
  types.ts        ← Tipos del dominio (Product, CartItem, etc.)
  validation.ts   ← Toda la lógica de validación
  utils.ts        ← Utilidades puras (cn, formatPrice)
  mock-data.ts    ← Datos y funciones de acceso (getFeaturedProducts, etc.)

src/config/
  store.config.ts ← Todo el contenido de marca: copy, rutas, nav, colores de texto
  theme.config.ts ← Paleta OKLCH y tipografía
```

---

## 3. Configuración y White-Label

### Fuentes de verdad

| Tipo de dato                                           | Dónde vive                                                |
| ------------------------------------------------------ | --------------------------------------------------------- |
| Nombre de marca, tagline, copyright                    | `store.config.ts → brand`                                 |
| Rutas de navegación                                    | `store.config.ts → routes` y `navigation`                 |
| Textos visibles en homepage (eyebrows, headings, CTAs) | `store.config.ts → homePageContent`                       |
| Métodos de pago                                        | `store.config.ts → paymentMethods`                        |
| Redes sociales y contacto                              | `store.config.ts → social` y `contact`                    |
| Colores OKLCH                                          | `theme.config.ts → brandColors` + `globals.css → :root`   |
| Tipografía                                             | `theme.config.ts → typography` + `layout.tsx` (next/font) |

### Verificación antes de cada commit

- [ ] ¿Hay algún string de UI hardcodeado en un `.tsx` que debería estar en `store.config.ts`?
- [ ] ¿El footer, header y nav siguen leyendo de la config y no tienen valores fijos?
- [ ] Si se añade una nueva sección con texto, ¿ese texto viene de un prop o de la config?

---

## 4. TypeScript

### Reglas obligatorias

```typescript
// ✅ Usar tipos del dominio
import type { Product } from "@/lib/types"
function ProductCard({ product }: { product: Product }) { ... }

// ❌ Nunca tipos inline que dupliquen un tipo existente
function ProductCard({ product }: { product: { id: string; name: string; price: number ... } }) { ... }

// ✅ Exportar interfaces cuando más de un archivo las usa
export interface HeroBanner { title: string; image: string; ... }

// ✅ Tipar props de componentes con interfaces propias
interface HeroSectionProps { banners: HeroBanner[]; eyebrow: string }

// ❌ Evitar any
const data: any = fetch(...)  // usar tipado correcto o unknown + type guard
```

### Verificación

- [ ] `yarn type-check` pasa sin errores (`tsc --noEmit`)
- [ ] No hay tipos `any` nuevos
- [ ] No hay tipos inline que dupliquen interfaces existentes en `types.ts`
- [ ] Props nuevas tienen interface declarada explícitamente

---

## 5. Accesibilidad (WCAG 2.1 AA)

### Checklist obligatorio para cada componente nuevo

**Semántica HTML:**

- [ ] Un solo `<h1>` por página (nunca uno en desktop y otro en mobile)
- [ ] Jerarquía de headings sin saltos: `h1 → h2 → h3` (nunca `h1 → h3`)
- [ ] `<button>` para acciones, `<a>` para navegación — nunca `<div onClick>`
- [ ] `<section>` con `aria-label` o `aria-labelledby` para landmarks accesibles
- [ ] `<blockquote>` solo para citas externas, no para copy de la marca

**Imágenes:**

- [ ] `alt=""` en imágenes decorativas (dentro de links con texto visible)
- [ ] `alt="descripción"` en imágenes que transmiten información
- [ ] `sizes` prop en todos los `<Image fill>` para evitar descargas innecesarias

**Interactividad:**

- [ ] Elementos interactivos tienen `aria-label` si no tienen texto visible
- [ ] Botones de toggle tienen `aria-pressed`
- [ ] Listas de radio tienen `role="radiogroup"` y cada opción `role="radio"` + `aria-checked`
- [ ] Cambios de contenido dinámico usan `aria-live="polite"` (o `"assertive"` para errores)
- [ ] `tabIndex={0}` NO se añade a elementos que ya son focusables (`<a>`, `<button>`)
- [ ] `aria-hidden` usa string `"true"` o se omite — nunca `aria-hidden={false}` (inconsistente en AT)

**Formularios:**

- [ ] Cada input tiene `<label>` o `aria-label`
- [ ] Errores de validación usan `aria-invalid` y `aria-describedby`
- [ ] Validación en blur, no solo en submit

**Color:**

- [ ] Contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande (≥18px bold)
- [ ] Verde salvia sobre blanco: verificar con https://oklch.com antes de usar

---

## 6. Performance

### Imágenes

```tsx
// ✅ Siempre definir sizes en imágenes fill
<Image fill sizes="(max-width: 768px) 100vw, 50vw" />

// ✅ priority solo en imágenes above-the-fold (primeras 3-4 visibles)
<Image priority={index < 4} />

// ❌ Nunca priority={true} a todos los productos de una lista
{products.map(p => <Image priority />)}  // descarga todo a la vez → peor LCP
```

### Server vs Client Components

```tsx
// ✅ Preferir Server Components siempre que sea posible
// Solo añadir "use client" si el componente usa:
//   useState, useEffect, useRef, event handlers del DOM, o APIs del browser

// ❌ No añadir "use client" innecesariamente
"use client" // solo porque renderiza texto — no hace falta
export function StaticSection() {
  return <p>Texto</p>
}
```

### Estado y renders

```tsx
// ✅ Constantes fuera del componente (no se recrean en cada render)
const MARQUEE_ITEMS = [...features, ...features]
export function TrustBar() { ... }

// ❌ Arrays/objetos literales dentro del componente sin useMemo
export function TrustBar() {
  const items = [...features, ...features]  // nuevo array en cada render
}
```

---

## 7. Seguridad

### Reglas absolutas

- **PCI DSS**: Los datos de tarjeta (número, CVV, expiración) NUNCA se almacenan ni se envían a nuestros servidores. Se tokeniza en el cliente vía el SDK del gateway (MercadoPago, Stripe).
- **Variables de entorno**: Secretos (API keys, tokens de pago) solo en `.env.local`. Nunca en código fuente. El archivo `.env.local.example` documenta las variables sin valores.
- **`NEXT_PUBLIC_`**: Solo para valores que son seguros exponer al cliente (public keys de MercadoPago, IDs de analytics). Nunca para secrets.
- **Inputs del usuario**: Validar en cliente Y en servidor (cuando exista backend). La validación de cliente es UX, la de servidor es seguridad.
- **Rutas API**: Cuando se implementen, incluir rate limiting en endpoints de pago y autenticación.

### Verificación

- [ ] ¿Alguna variable de entorno con `SECRET` o `KEY` se expone en código cliente?
- [ ] ¿Algún dato sensible se almacena en `localStorage` o cookies sin cifrar?
- [ ] ¿Los inputs del usuario se usan directamente en queries/comandos sin sanitizar?

---

## 8. Patrones Establecidos — Usar siempre estos

### Precios y moneda

```tsx
// ✅ Siempre usar formatPrice del utils
import { formatPrice } from "@/lib/utils"
<span>{formatPrice(product.price)}</span>

// ❌ Nunca toLocaleString() sin locale (browser-dependent)
<span>${product.price.toLocaleString()}</span>
```

### Rutas

```tsx
// ✅ Siempre usar routes del config
import { routes } from "@/config/store.config"
<Link href={routes.cart}>Carrito</Link>

// ❌ Nunca strings hardcodeados para rutas
<Link href="/carrito">Carrito</Link>
```

### Validación

```tsx
// ✅ Siempre usar validation.ts
import { validateShippingData, validatePaymentData } from "@/lib/validation"

// ❌ Nunca lógica de validación inline en componentes
const isValid = email.includes("@") && email.includes(".")
```

### Clases condicionales

```tsx
// ✅ Siempre usar cn() de utils para combinar clases
import { cn } from "@/lib/utils"
className={cn("base-class", condition && "conditional-class")}

// ❌ Nunca template literals con ternarios para clases Tailwind
className={`base-class ${condition ? "class-a" : "class-b"}`}
// (tailwind-merge no puede optimizar template literals)
```

### Toasts / notificaciones

```tsx
// ✅ Siempre usar Sonner directamente o useSonner hook
import { toast } from "sonner"
toast.success("Mensaje")

// ❌ Nunca otro sistema de notificaciones
import { toast } from "react-hot-toast" // eliminado del proyecto
```

### Estado de favoritos

```tsx
// ✅ Siempre useFavorites hook
const { isFavorite, toggleFavorite } = useFavorites(product.id)

// ❌ Nunca useState(false) local para favoritos
const [isFavorite, setIsFavorite] = useState(false) // se pierde en navegación
```

---

## 9. Estilo de Código

### Comentarios

```tsx
// ✅ Comentar el POR QUÉ cuando no es obvio
// Two copies: translateX(-50%) moves exactly one copy-width → seamless loop.
// Three copies would move 1.5×, causing a mid-item jump on reset.
const items = [...features, ...features]

// ❌ Nunca comentar el QUÉ (el código ya lo dice)
// Map over products and render a ProductCard for each
{
  products.map((p) => <ProductCard product={p} />)
}

// ❌ Nunca comentarios de sección que explican CSS obvio
{
  /* ── Imagen ── order-first: aparece ARRIBA en mobile */
}
```

### Imports

```tsx
// Orden: React/Next → librerías externas → componentes internos → utils/tipos
import { useState } from "react"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product/product-card"
import { formatPrice, cn } from "@/lib/utils"
import type { Product } from "@/lib/types"
```

### Nombres

```
Componentes: PascalCase   → ProductCard, HeroSection
Hooks:       camelCase    → useFavorites, useCart
Utilidades:  camelCase    → formatPrice, cn
Constantes:  UPPER_SNAKE  → MARQUEE_ITEMS, FAVORITES_KEY
Archivos:    kebab-case   → product-card.tsx, use-favorites.ts
```

---

## 10. Pipeline de Calidad — Ejecutar antes de cada commit

```bash
yarn validate
# Equivale a:
#   yarn type-check    → tsc --noEmit (0 errores TypeScript)
#   yarn lint          → next lint (0 warnings ESLint)
#   yarn format:check  → prettier --check (formato consistente)
```

Si falla alguno de los tres, **no mergear**. Corregir primero.

```bash
# Corregir formato automáticamente
yarn format

# Corregir ESLint automáticamente (solo lo que puede)
yarn lint:fix
```

---

## 11. Checklist de PR — Antes de cada pull request

### Código

- [ ] `yarn validate` pasa sin errores ni warnings
- [ ] No hay tipos `any` nuevos
- [ ] No hay strings de UI hardcodeados que deberían estar en config
- [ ] No hay lógica de negocio en componentes de UI (va en `lib/`)
- [ ] No hay `console.log` en código que vaya a producción

### Componentes nuevos

- [ ] ¿Necesita `"use client"`? Si no usa estado/efectos, quitarlo
- [ ] ¿Tiene guard para arrays vacíos o datos undefined?
- [ ] ¿Las imágenes tienen `sizes` y `alt` correctos?
- [ ] ¿Los elementos interactivos tienen `aria-label` o texto visible?
- [ ] ¿Las secciones tienen `aria-label` o `aria-labelledby`?

### Datos y config

- [ ] ¿Nuevas rutas se agregaron a `store.config.ts → routes`?
- [ ] ¿Nuevas secciones de texto se agregaron a `homePageContent` o similar en config?
- [ ] ¿Nuevas variables de entorno se documentaron en `.env.local.example`?

### Documentación

- [ ] Si se resolvió un bug, actualizar `ROADMAP.md`
- [ ] Si se completó un módulo, actualizar tabla de `ROADMAP.md`
- [ ] Si hay un cambio arquitectónico significativo, actualizar `AUDIT.md` o `ROADMAP.md`

---

_Este documento es vivo. Si se establece un nuevo patrón en el proyecto que no está aquí, agregarlo._
_Referencias: `AUDIT.md` (estado técnico), `ROADMAP.md` (qué falta), `PROJECT.md` (visión y negocio)._
