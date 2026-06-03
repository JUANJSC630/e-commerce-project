# PROJECT — Dulce Infancia Shop
> Documento vivo de visión, propósito y alcance del proyecto  
> Última actualización: 2026-06-03

---

## Visión del Proyecto

Construir una tienda en línea **completa, funcional y escalable**, especializada en la venta de productos de tendencia y alto valor percibido: comenzando con **ropa infantil de calidad** como categoría ancla, con capacidad de expansión hacia accesorios para celulares, artículos para el hogar y productos virales de redes sociales.

El objetivo principal es **establecer una marca confiable** en el mercado hispanohablante y **aumentar ventas de forma sostenida** a través de una plataforma de comercio electrónico robusta, estrategias de marketing digital integradas y una experiencia de usuario que genere confianza y recompra.

---

## Nombre y Marca Actual

| Campo | Valor |
|-------|-------|
| Nombre | **Dulce Infancia** |
| Tagline | *Ropa adorable para los más pequeños* |
| Mercado objetivo | Colombia y mercado hispanohablante |
| Moneda | COP (pesos colombianos) |
| Idioma | Español (es-CO) |
| Identidad visual | Paleta cálida, tono amigable y confiable, orientado a padres de 25-40 años |

> **Nota arquitectónica**: El proyecto está diseñado para ser un **white-label configurable**. Toda la información de marca, rutas, navegación, textos y colores están centralizados en `src/config/store.config.ts` y `src/config/theme.config.ts`. Clonar para otro cliente requiere únicamente actualizar esos dos archivos.

---

## Stack Tecnológico

| Capa | Tecnología | Decisión |
|------|-----------|---------|
| Framework | Next.js 14 (App Router) | SSR + ISR para SEO, routing nativo |
| Lenguaje | TypeScript | Tipado fuerte en productos, carrito, config |
| Estilos | Tailwind CSS v4 | Sistema de tokens OKLCH, dark mode ready |
| Componentes | shadcn/ui (Radix UI) | Accesibilidad base, composable |
| Fuentes | Google Fonts via `next/font` | Sin layout shift, optimización automática |
| Notificaciones | Sonner | Toast system unificado (migrar desde react-hot-toast) |
| Estado del carrito | React Context + Provider | Sin dependencias externas, extensible |
| Mock data | `src/lib/mock-data.ts` | Datos locales hasta integración de backend real |
| Deploy objetivo | Vercel | Edge network, integración nativa Next.js |

---

## Modelo de Negocio

### Categorías de productos (actuales y planificadas)

| Categoría | Estado | Descripción |
|-----------|--------|-------------|
| Bebés (0-24m) | ✅ Activa | Bodies, ranitas, gorros, botitas, sets |
| Niñas | ✅ Activa | Vestidos, faldas, chaquetas, tops |
| Niños | ✅ Activa | Conjuntos, pantalones, camisetas |
| Ofertas / Sales | ✅ Activa | Productos con `isOnSale: true` y descuento visible |
| Esenciales | ✅ Activa | Prendas básicas de alta rotación |
| Accesorios para celulares | 🔲 Planificada | Fase 2 — Capas de tendencia viral |
| Artículos para el hogar | 🔲 Planificada | Fase 2 — Alta demanda en redes sociales |
| Productos virales | 🔲 Planificada | Fase 3 — Selección curada de tendencias TikTok/Instagram |

### Propuesta de valor diferenciadora

1. **Curación de productos de tendencia** — No catálogo genérico, sino selección basada en viralidad y demanda real.
2. **Marca confiable** — Diseño profesional, pagos seguros, tracking de pedidos, empaque especial.
3. **Experiencia móvil primero** — El 70%+ de compras en categorías de tendencia ocurre desde celular.
4. **Escalabilidad** — Arquitectura diseñada para agregar categorías y productos sin refactorización.

---

## Flujo de Compra (User Journey)

```
Descubrimiento
  │
  ▼
Landing / Home ──────────────────────────────────────────────────────┐
  │  Hero carousel con ofertas clave                                  │
  │  Grid de productos destacados                                     │
  │  Features: envío rápido, pago seguro, calidad garantizada         │
  │                                                                   │
  ▼                                                                   │
Navegación por Categoría (/category/[slug])                          │
  │  Filtros por talla, color, precio (pendiente)                     │
  │  Breadcrumbs de orientación (pendiente)                           │
  │                                                                   │
  ▼                                                                   │
Detalle del Producto (/products/[id])   ← PENDIENTE                  │
  │  Galería de imágenes                                              │
  │  Selector de talla y color                                        │
  │  Descripción + reviews                                            │
  │  CTA "Agregar al carrito" / MiniCart overlay                      │
  │                                                                   │
  ▼                                                                   │
Carrito (/carrito)                                                    │
  │  Listado de items con edición de cantidad                         │
  │  Resumen de subtotal + costo de envío                             │
  │  Envío gratis al superar $150,000 COP                             │
  │                                                                   │
  ▼                                                                   │
Checkout (/checkout-flow)                                            │
  │  Paso 1: Datos de envío (nombre, dirección, ciudad, país)         │
  │  Paso 2: Método de pago                                           │
  │    · Tarjeta (Visa, Mastercard, Amex) con validación Luhn         │
  │    · MercadoPago                                                  │
  │    · Transferencia bancaria                                       │
  │  Paso 3: Confirmación de orden                                    │
  │                                                                   │
  ▼                                                                   │
Confirmación / Post-compra                                           │
  │  Número de orden + resumen                                        │
  │  Email de confirmación (pendiente)                                │
  └──────────────────────────────────────────────────────────────────┘
```

---

## Requisitos Clave del Proyecto

### 1. Diseño moderno e intuitivo

**Estado actual**: Base implementada. Puntos a mejorar identificados en AUDIT.md (score 6/20).

- Paleta de colores cálida y coherente con OKLCH (sistema de tokens completo)
- Tipografía con personalidad — reemplazar Montserrat/Inter por fuentes menos genéricas
- Composición visual asimétrica — eliminar el centrado total que genera aspecto genérico AI
- Cards de producto con variación de tamaño en secciones destacadas
- Hero con identidad propia, no overlay genérico centrado

### 2. Experiencia móvil optimizada

**Estado actual**: Crítico — el `<nav>` de desktop está oculto en móvil con `hidden md:flex` sin ninguna alternativa. Los usuarios en móvil solo ven logo y carrito. **Bloqueante de lanzamiento**.

- Menú hamburger con Sheet/Drawer — prioridad P0
- Touch targets mínimo 44×44px (actualmente 10px en dots del banner)
- Layouts responsive validados en 320px, 375px, 768px, 1024px, 1440px
- Checkout funcional en móvil (forms nativos, teclado numérico en campos de tarjeta)
- Performance: LCP < 2.5s en 4G, FID < 100ms

### 3. Sistema de pagos seguro

**Estado actual**: Estructura de checkout implementada con validación Luhn en tarjetas. Sin integración real aún.

**Integraciones planeadas**:
| Gateway | Prioridad | Mercado |
|---------|-----------|---------|
| MercadoPago | Alta | Colombia, Argentina, México, Chile, Brasil |
| Stripe | Media | Internacional, tarjetas globales |
| PSE (pagos por ACH) | Alta | Colombia específico |
| Wompi | Media | Colombia, procesador local |
| PayU | Media | Latinoamérica |

**Requisitos de seguridad**:
- PCI DSS compliance (los datos de tarjeta NUNCA deben pasar por nuestro servidor; siempre tokenizados por el gateway)
- HTTPS obligatorio
- Validación de formularios en cliente Y servidor
- CSRF protection en endpoints de pago
- Rate limiting en intentos de pago

### 4. Seguimiento de pedidos

**Estado actual**: No implementado. Existe confirmación de orden en checkout pero sin persistencia.

**Flujo planificado**:
```
Cliente realiza compra
  → Número de orden generado (UUID o secuencial)
  → Email de confirmación con detalles
  → Estado: Pendiente → Confirmado → En preparación → Enviado → Entregado
  → Página /cuenta/pedidos/[id] con timeline visual
  → Notificación por email en cada cambio de estado
  → Integración con guía de envío (Interrapidísimo, Servientrega, Coordinadora en Colombia)
```

### 5. Marketing integrado

**Herramientas planificadas**:

| Herramienta | Propósito | Prioridad |
|-------------|-----------|-----------|
| Meta Pixel (Facebook/Instagram) | Retargeting, conversiones, audiencias similares | Alta |
| Google Analytics 4 + Tag Manager | Embudo de conversión, comportamiento de usuario | Alta |
| TikTok Pixel | Audiencias de productos virales | Media |
| Open Graph / Twitter Cards | Previsualizaciones en redes al compartir productos | Alta |
| Email marketing (MailerLite / Klaviyo) | Abandono de carrito, newsletters, reactivación | Media |
| Cupones y descuentos | Código promo en checkout | Media |
| Wishlist compartible | Viralidad orgánica en redes | Baja |
| Reviews y calificaciones | Social proof en detalle de producto | Media |
| Banners de countdown | Urgencia en ofertas con tiempo limitado | Baja |

**SEO técnico**:
- `generateMetadata()` por ruta (título, descripción, OG, robots)
- Structured data `Product` schema (schema.org) en detalle de producto
- `sitemap.ts` generado automáticamente
- URLs limpias y descriptivas
- Core Web Vitals: LCP, CLS, FID en verde

### 6. Escalabilidad y extensibilidad

**Arquitectura para escalar**:

```
Fase 1 (actual)    → Mock data local, sin backend
Fase 2             → CMS headless (Contentful / Sanity) para productos
Fase 3             → API REST o GraphQL propia con base de datos
Fase 4             → Microservicios: inventario, pedidos, pagos separados
```

**Principios de diseño para escalar**:
- `store.config.ts` centraliza toda la configuración — agregar categoría = 1 objeto en el array
- Tipos TypeScript estrictos en `types.ts` — cualquier nueva propiedad de producto se propaga automáticamente
- Componentes sin acoplamiento a datos específicos — `ProductCard` recibe `Product` genérico
- CSS con sistema de tokens — cambiar el tema completo = cambiar 6 variables OKLCH
- Rutas dinámicas (`/category/[slug]`, `/products/[id]`) — nuevas categorías sin nuevos archivos de página

---

## Identidad de Marca y Diseño

### Paleta actual (OKLCH)

| Token | Valor | Uso |
|-------|-------|-----|
| `--brand-base` | `oklch(0.75 0.15 75)` | Botones, precio destacado, CTA |
| `--brand-on-base` | `oklch(0.15 0.02 60)` | Texto sobre botones |
| `--brand-surface` | `oklch(0.98 0.008 75)` | Fondo de página, cards |
| `--brand-surface-alt` | `oklch(0.95 0.01 75)` | Secciones alternativas, inputs |
| `--brand-muted` | `oklch(0.60 0.015 60)` | Texto secundario, bordes |
| `--brand-ink` | `oklch(0.20 0.015 55)` | Títulos, texto principal |

### Tipografía (pendiente reemplazo)

| Rol | Actual | Recomendado |
|-----|--------|-------------|
| Display / Headings | Montserrat | **Baloo 2** o **Nunito** (cálida, redondeada) |
| Body / UI | Inter | **Atkinson Hyperlegible** (accesible) o **Source Sans 3** |

### Tono de comunicación

- **Cálido y cercano** — hablar de "tu pequeño", "prendas adorables", "diseñado con cariño"
- **Confiable** — énfasis en calidad garantizada, pagos seguros, envíos rápidos
- **Sin exceso de diminutivos** — el tono es adulto (le habla a padres/madres, no a niños)
- **Español neutro con colombianismos suaves** — comprensible en todo el mercado hispanohablante

---

## KPIs y Métricas de Éxito

### Técnicas (Año 1)
| Métrica | Objetivo |
|---------|----------|
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 |
| LCP | < 2.5s |
| CLS | < 0.1 |
| Uptime | ≥ 99.9% |
| Mobile conversion rate | ≥ 2.5% |

### Negocio (Año 1)
| Métrica | Objetivo |
|---------|----------|
| Tasa de conversión general | ≥ 3% |
| Tasa de abandono de carrito | ≤ 65% |
| Valor promedio de orden | ≥ $85,000 COP |
| Tasa de recompra | ≥ 25% |
| NPS (Net Promoter Score) | ≥ 50 |

---

## Fases del Proyecto

### Fase 0 — Fundación ✅ (actual)
Scaffolding con Next.js, sistema de diseño, carrito funcional, checkout multi-paso, categorías con mock-data.

### Fase 1 — MVP Lanzable (próxima)
Todo lo necesario para abrir al público:
- Nav móvil funcional
- Página de detalle de producto
- Footer
- Bug fixes críticos del AUDIT
- Imágenes reales
- Dominio y deploy en Vercel

### Fase 2 — Crecimiento
- Buscador y filtros avanzados
- Integración de pasarela de pago real (MercadoPago prioritario)
- CMS headless para gestión de productos sin código
- Email transaccional (confirmaciones, abandono de carrito)
- Panel de administración básico
- Analytics y Meta Pixel

### Fase 3 — Escala
- Nuevas categorías (accesorios, hogar, productos virales)
- Sistema de reviews y valoraciones
- Programa de referidos
- Wishlist compartible en redes sociales
- Notificaciones push (back-in-stock, ofertas flash)
- Búsqueda con IA (recomendaciones personalizadas)

### Fase 4 — Optimización
- A/B testing en hero, CTA, checkout
- Personalización por comportamiento
- App móvil nativa o PWA instalable
- Internacionalización (i18n) para otros mercados

---

## Referencias Cruzadas

| Documento | Contenido |
|-----------|-----------|
| [ROADMAP.md](./ROADMAP.md) | Estado actual de módulos, bugs pendientes, plan de ejecución técnico por fases |
| [AUDIT.md](./AUDIT.md) | Auditoría técnica completa: accesibilidad, performance, responsive, theming (score 6/20) |
| [`src/config/store.config.ts`](./src/config/store.config.ts) | Toda la configuración de la marca: nombre, rutas, nav, categorías, pagos, banners |
| [`src/config/theme.config.ts`](./src/config/theme.config.ts) | Paleta de colores OKLCH y tipografía |
| [`src/lib/types.ts`](./src/lib/types.ts) | Tipos TypeScript del dominio: `Product`, `CartItem`, `CartContextType` |
| [`src/lib/mock-data.ts`](./src/lib/mock-data.ts) | Catálogo de productos de prueba en español |

---

*Este documento debe actualizarse al completar cada fase y al tomar decisiones arquitectónicas significativas.*
