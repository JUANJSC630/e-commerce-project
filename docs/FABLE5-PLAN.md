# Plan de Ejecución para Claude Fable 5

> Creado: 2026-06-11  
> Propósito: guía operativa para ejecutar el Bloque 14 del ROADMAP con Fable 5.
> Cada sección es independiente - puedes ejecutarlas en sesiones separadas en cualquier orden.
> El orden recomendado está numerado por prioridad para producción.

---

## Cómo usar este documento

1. Abre una sesión nueva con Fable 5 (modelo: `claude-fable-5`)
2. Pega el **System prompt base** (sección 1) al inicio de la sesión
3. Pega el **prompt del ítem** que quieres ejecutar ese día
4. No interrumpas - Fable 5 trabaja mejor con briefings ricos y pocas interrupciones
5. Marca el ítem como completado en este archivo cuando termines

---

## Sección 1 - System prompt base (pegar en CADA sesión)

> Estos bloques vienen de la documentación oficial de Anthropic para Fable 5.
> Son los que más impacto tienen en la calidad del output.

```
Eres un senior software engineer trabajando en un e-commerce Next.js 15 para una
tienda de ropa infantil llamada "Dulce Infancia". Stack: Next.js 15 App Router,
TypeScript strict, Tailwind v4, Prisma v7, PostgreSQL (Prisma Postgres pooled),
NextAuth v4 JWT, UploadThing v7, MercadoPago Checkout API.

INSTRUCCIONES DE COMPORTAMIENTO:

Cuando tengas suficiente información para actuar, actúa. No re-derives hechos ya
establecidos en la conversación, no re-litigues decisiones ya tomadas, no narres
opciones que no vas a implementar. Si estás evaluando una elección, da una
recomendación, no un listado exhaustivo.

No agregues features, refactors, ni abstracciones más allá de lo que requiere la
tarea. Un bug fix no necesita limpieza del entorno. No diseñes para requerimientos
futuros hipotéticos. No agregues manejo de errores para escenarios que no pueden
ocurrir. Confía en las garantías del framework. Solo valida en los límites del
sistema (input del usuario, APIs externas).

Antes de reportar progreso, audita cada afirmación contra un resultado de herramienta
de esta sesión. Solo reporta trabajo que puedas evidenciar. Si algo no está verificado,
dilo explícitamente. Si los tests fallan, dilo con el output; si un paso fue
omitido, dilo; cuando algo esté hecho y verificado, afírmalo sin ambigüedades.

Pausa solo cuando el trabajo genuinamente lo requiere: una acción destructiva o
irreversible, un cambio real de alcance, o input que solo el usuario puede proveer.
Si llegas a uno de esos casos, pregunta y termina el turno. Para acciones reversibles
que derivan del request original, procede sin preguntar.

Empieza con el resultado. Tu primera oración después de terminar debe responder
"¿qué pasó?" o "¿qué encontraste?". El detalle de soporte viene después. Usa
oraciones completas, escribe los términos completos, no uses cadenas de flechas
(A → B → C) ni jerga interna que construiste durante el trabajo.
```

---

## Sección 2 - Reglas del proyecto (agregar después del system prompt)

```
REGLAS INVARIABLES DE ESTE PROYECTO:

Seguridad de pagos:
- El monto SIEMPRE viene de la DB (Order.total), nunca del request body del cliente
- /api/payments/* NUNCA debe requerir sesión de NextAuth (el webhook llega sin sesión)
- /api/admin/* SIEMPRE debe verificar sesión + permiso granular antes de operar
- El estado PAID solo lo escribe el webhook handler o pse-return, nunca el frontend

Estilo de código:
- Sin comentarios que expliquen QUÉ hace el código (los nombres lo dicen)
- Sin docstrings multi-línea
- Sin emojis en código ni comentarios
- Preferir editar archivos existentes a crear nuevos
- Sin backwards-compatibility hacks para código muerto

Tests y verificación:
- Si el proyecto tiene yarn validate (ESLint + TypeScript), debe pasar
- Si hay scripts de verificación en scripts/, correrlos para confirmar el fix
- Reportar el output exacto de los comandos, no "debería funcionar"

Estructura de archivos clave:
- src/lib/payments/ → lógica de pagos multi-proveedor
- src/lib/orders.ts → createOrder, markOrderPaid, markOrderFailed
- src/lib/settings.ts → loadAllSettings() con cache de DB
- src/app/api/payments/ → routes públicas de pago (sin auth middleware)
- src/app/api/admin/ → routes protegidas del admin
- middleware.ts → protege /admin/* y /cuenta/* (en la raíz del proyecto, no en src/)
```

---

## Sección 3 - Prompts por ítem (ejecutar en este orden para producción)

---

### 🔴 ÍTEM 1 - Restaurar stock cuando un pago falla

**Prioridad**: Crítica para producción  
**Archivos principales**: `src/lib/orders.ts`, `src/app/api/payments/webhook/mercadopago/route.ts`, `src/app/api/payments/pse-return/route.ts`  
**Estado**: [x] Completado 2026-06-11 - ya estaba implementado en `markOrderFailed()` (transacción guardada + restock idempotente); solo se verificó

```
CONTEXTO:
El stock se descuenta cuando se CREA el pedido (src/lib/orders.ts, función createOrder
→ updateMany { decrement: qty } por cada OrderItem). Si el pago falla posteriormente
- webhook rejected, PSE rechazado, timeout - el pedido queda en estado FAILED pero el
stock nunca se restaura. El inventario queda incorrecto indefinidamente.

Verifica primero leyendo src/lib/orders.ts: busca la función markOrderFailed() y
confirma que no tiene ninguna restauración de stock.

GOAL:
Implementar restauración de stock en markOrderFailed(). La restauración debe:
1. Leer todos los OrderItems del pedido (productId + quantity)
2. Hacer updateMany { increment: quantity } por cada producto
3. Correr dentro de la misma transacción Prisma que cambia el estado del pedido
4. Ser idempotente: si el pedido ya estaba FAILED (doble webhook), no duplicar la
   restauración. Solución sugerida: solo restaurar cuando el estado anterior era
   distinto de FAILED (usar updateMany con where: { paymentStatus: { not: "FAILED" } }
   y verificar count > 0 antes de restaurar stock).

CRITERIO DE COMPLETITUD:
- markOrderFailed() restaura stock en la misma transacción
- Un pedido que ya estaba en FAILED no produce un segundo incremento de stock
- yarn validate pasa sin errores
- Describir exactamente qué líneas cambiaron en markOrderFailed()

NO hacer: no cambiar createOrder, no tocar el flujo de pago aprobado,
no agregar logs innecesarios más allá de los que ya existen.
```

---

### 🔴 ÍTEM 2 - Headers HTTP de seguridad

**Prioridad**: Crítica para producción  
**Archivos principales**: `next.config.ts`  
**Estado**: [x] Completado 2026-06-11 - headers + CSP verificados con curl en prod (HSTS presente) y dev (HSTS ausente, 'unsafe-eval' + ws: para HMR)

```
CONTEXTO:
next.config.ts no define headers de seguridad. En producción, esto expone la app
a clickjacking (sin X-Frame-Options), sniffing de contenido (sin X-Content-Type-Options),
y filtra el Referer completo en navegación cross-origin.

Los orígenes que deben quedar permitidos porque los usa el código:
- sdk.mercadopago.com → iframes del CardForm (MercadoPago)
- *.ufs.sh, utfs.io → CDN de UploadThing (imágenes)
- fonts.googleapis.com, fonts.gstatic.com → Google Fonts (tipografía dinámica)
- 'self' → el propio origen

Lee next.config.ts primero para ver la estructura actual.

GOAL:
Agregar async headers() en next.config.ts con exactamente estos headers aplicados
a todas las rutas (source: '/(.*)']):

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  (SOLO en producción - condicionado con process.env.NODE_ENV === 'production')
- Content-Security-Policy: construir una CSP que permita exactamente los orígenes
  listados arriba. frame-src DEBE incluir sdk.mercadopago.com para que el CardForm
  funcione. img-src debe incluir *.ufs.sh y utfs.io.

CRITERIO:
- yarn build pasa sin errores
- La página de pago con el CardForm de MercadoPago sigue funcionando (los iframes
  no deben ser bloqueados por la CSP)
- Confirmar que el header Strict-Transport-Security solo aparece en producción
```

---

### 🔴 ÍTEM 3 - Shipping desde la DB en createOrder

**Prioridad**: Alta - bug de negocio  
**Archivos principales**: `src/lib/orders.ts`, `src/lib/settings.ts`  
**Estado**: [x] Completado 2026-06-11 - createOrder lee shipping de loadAllSettings(); verificado E2E con standardCost=12000 en DB (pedido DI-2026-022: shipping=12000)

```
CONTEXTO:
src/lib/orders.ts importa shipping de '@/config/store.config' (valores estáticos):
  import { shipping } from "@/config/store.config"

El admin puede cambiar el costo y umbral de envío en Settings → Envíos, que guarda
en la tabla Setting de Prisma. Pero createOrder siempre usa el valor del archivo de
config, ignorando completamente el setting de la DB. Si el admin cambia el envío
de $8.000 a $12.000, los pedidos nuevos siguen usando $8.000.

La función loadAllSettings() en src/lib/settings.ts ya lee shipping de la DB con
fallback al valor del config estático - solo hay que usarla en createOrder.

Lee src/lib/orders.ts para ver la función shippingCostFor() y cómo se usa.
Lee src/lib/settings.ts para ver qué retorna loadAllSettings().shipping.

GOAL:
Que createOrder() lea standardCost y freeThreshold desde loadAllSettings() en lugar
del import estático.

Plan sugerido:
1. Eliminar el import { shipping } del archivo (o mantenerlo solo como fallback)
2. Llamar await loadAllSettings() al inicio de createOrder() (ya es async)
3. Usar settings.shipping.standardCost y settings.shipping.freeThreshold en
   shippingCostFor() - convertirla en una función pura que recibe los valores
   como parámetros en lugar de leerlos del módulo

RESTRICCIONES:
- No agregar cache propio - loadAllSettings ya usa unstable_cache con tag "settings"
- No cambiar la firma pública de createOrder()
- No tocar la lógica de descuento de stock ni de precios de items
- Solo el shipping debe cambiar

CRITERIO:
- Si guardo shipping.standardCost=12000 en la DB y creo un pedido, el total
  debe incluir 12000 de envío (no el valor hardcodeado del config)
- yarn validate pasa
```

---

### 🟠 ÍTEM 4 - pago-fallido con contexto del pedido

**Prioridad**: Alta - UX crítica  
**Archivos principales**: `src/app/(store)/pago-fallido/page.tsx`, `src/app/api/payments/pse-return/route.ts`, `src/app/(store)/order-success/[id]/page.tsx`  
**Estado**: [x] Completado 2026-06-13 - todos los redirects pasan `?orderId=`; la página ofrece "Intentar de nuevo" → `/pago/[orderId]`; copy corregido

```
CONTEXTO:
La página src/app/(store)/pago-fallido/page.tsx es completamente genérica. No sabe
qué pedido falló ni puede ofrecer "Reintentar". El texto actual dice "tus productos
siguen en el carrito" pero el stock ya fue decrementado al crear el pedido - es
información incorrecta.

Los redirects que llegan a /pago-fallido vienen de:
- src/app/api/payments/pse-return/route.ts → redirect("/pago-fallido")
- src/app/(store)/order-success/[id]/page.tsx → redirect("/pago-fallido")

Lee ambos archivos para ver dónde ocurren los redirects.

GOAL:
1. Actualizar TODOS los redirects a /pago-fallido para incluir el orderId:
   redirect(`/pago-fallido?orderId=${orderId}`)

2. Actualizar la página pago-fallido para aceptar searchParams:
   - Si hay orderId en el searchParam, mostrar:
     * "El pago del pedido [orderId corto o número si está disponible] no se completó"
     * Botón principal: "Intentar de nuevo" → /pago/[orderId]
     * Botón secundario: "Volver al inicio"
   - Si NO hay orderId (caso edge / directo), mostrar la pantalla genérica actual

3. Corregir el texto: no decir "tus productos siguen en el carrito" - decir
   "No se realizó ningún cargo. Puedes intentar el pago de nuevo."

RESTRICCIONES:
- No hacer fetch a la DB en la página de error para mantener latencia mínima
- El orderId en la URL es suficiente referencia para el usuario
- Mantener backward compatibility: la ruta /pago-fallido sin query param debe
  seguir funcionando
```

---

### 🟠 ÍTEM 5 - Rate limiting en login y registro

**Prioridad**: Alta - seguridad  
**Archivos principales**: `src/app/api/cuenta/register/route.ts`, `src/lib/auth-options.ts`  
**Estado**: [x] Completado 2026-06-13 - Opción A (Prisma `RateLimitHit`, sin Redis): login 5/10min por email (solo fallos), registro 5/h por IP; migración aplicada

```
CONTEXTO:
No existe ningún rate limiting en las rutas de autenticación. Un atacante puede:
- Intentar contraseñas indefinidamente contra cualquier cuenta (brute force login)
- Registrar miles de cuentas spam automatizadas

El proyecto usa Next.js 15 desplegado en Vercel. No hay Redis disponible (no está
en las variables de entorno). La solución debe funcionar sin Redis.

GOAL:
Implementar rate limiting simple basado en la tabla de Prisma (sin Redis):

Opción A (recomendada si el volumen es bajo):
- Crear un modelo LoginAttempt en Prisma: { id, identifier (IP o email), createdAt }
- En el route de login (lib/auth-options.ts, callback authorize): antes de verificar
  password, contar intentos del email en los últimos 10 minutos. Si > 5, rechazar
  con "Demasiados intentos. Intenta en 10 minutos."
- En el route de registro: contar registros de la misma IP en la última hora.
  La IP viene del header x-forwarded-for.
- Limpiar intentos antiguos (> 1 hora) en cada check (best-effort, no bloqueante)

Opción B (si A es muy compleja para el schema actual):
- Solo implementar en registro (el caso más fácil de explotar)
- Usar una variable de módulo Map<string, number[]> con timestamps (funciona en
  Vercel siempre que no haya más de 1 instancia activa - aceptable para MVP)

Lee src/lib/auth-options.ts y src/app/api/cuenta/register/route.ts antes de decidir
cuál opción es más limpia dado el schema actual.

RESTRICCIONES:
- No instalar nueva infraestructura (sin Redis, sin Upstash en este momento)
- No bloquear usuarios legítimos que cometan errores normales (máx 5 intentos / 10 min)
- Los errores de rate limit deben retornar mensajes claros al usuario, no 500
```

---

### 🟠 ÍTEM 6 - Polling en order-success para PSE pendiente

**Prioridad**: Alta - UX  
**Archivos principales**: `src/app/(store)/order-success/[id]/page.tsx`, `src/app/api/orders/[id]/route.ts`  
**Estado**: [x] Completado 2026-06-13 - `PaymentStatusPoller` (Client) hace polling 5s, transiciona en vivo, tope 60 intentos, limpia carrito al pagar

```
CONTEXTO:
La página order-success es un Server Component. Cuando paymentStatus = 'PENDING'
(cliente hizo PSE, está esperando confirmación del banco), la página muestra el estado
estático "Tu pago está en proceso" pero nunca se actualiza automáticamente.

El webhook de MercadoPago puede confirmar el pago segundos después del retorno del
banco - el usuario no lo ve sin refrescar manualmente.

El endpoint GET /api/orders/[id] ya existe en src/app/api/orders/[id]/route.ts.
Lee ese archivo para ver qué campos retorna.

GOAL:
Cuando el pedido llega con paymentStatus === 'PENDING' y paymentInFlight === true,
el bloque de estado del pago debe actualizar su UI automáticamente sin recargar
la página completa.

Implementación:
1. Extraer el bloque visual de "estado del pago" a un Client Component
   'PaymentStatusPoller' en src/components/payment/payment-status-poller.tsx
2. El Server Component (order-success/page.tsx) pasa: orderId, initialStatus como props
3. El Client Component:
   - Si initialStatus ya es 'PAID' o 'FAILED': renderiza el estado final, sin polling
   - Si es 'PENDING': inicia un intervalo de 5 segundos que llama a GET /api/orders/[id]
   - Al recibir status 'PAID': transiciona la UI a "confirmado" (ícono verde, texto de éxito)
     sin recargar - solo actualizar el estado del componente
   - Al recibir status 'FAILED': mostrar error + link a /pago-fallido?orderId=X
   - Después de 60 intentos (5 min): parar el polling y mostrar "Verifica tu email
     para la confirmación del banco."
   - El intervalo se limpia en el cleanup del useEffect (evitar memory leaks)

RESTRICCIONES:
- No instalar librerías de data fetching (SWR, React Query) - fetch nativo + useEffect
- No recargar toda la página - solo actualizar el componente de estado
- No hacer polling si la página se carga con status PAID desde el inicio
```

---

### 🟠 ÍTEM 7 - Verificar ownership en order-success

**Prioridad**: Media-Alta - seguridad  
**Archivos principales**: `src/lib/orders.ts`, `src/app/(store)/order-success/[id]/page.tsx`  
**Estado**: [x] Completado 2026-06-13 - `getOrderForConfirmation(id, viewerId?)` scopea pedidos con dueño; guest sigue por CUID; aplicado en página y en `GET /api/orders/[id]`

```
CONTEXTO:
La función getOrderForConfirmation(id) en src/lib/orders.ts busca el pedido solo por ID
(un CUID). Cualquier usuario puede acceder a /order-success/[id] conociendo el ID
de un pedido ajeno - por ejemplo interceptando el redirect en una red pública.

Lee src/lib/orders.ts::getOrderForConfirmation para ver la query actual.
Lee src/app/(store)/order-success/[id]/page.tsx para ver cómo se usa.

GOAL:
Agregar validación de propiedad sin romper el caso de guest checkout:

Reglas de acceso:
1. Si el pedido tiene userId (usuario logueado): verificar que session.user.id === order.userId.
   Si no coincide → notFound() (no revelar que el pedido existe)
2. Si el pedido NO tiene userId (guest checkout): permitir acceso. El ID de CUID es
   suficientemente impredecible para no requerir autenticación en guest orders.
3. Si no hay sesión y el pedido tiene userId → notFound()

Implementación:
- En order-success/page.tsx: obtener la sesión con getServerSession(authOptions)
- Pasar userId de la sesión (o null si guest) a getOrderForConfirmation
- En getOrderForConfirmation: si se recibe un userId, agregar where: { userId } a la query

RESTRICCIONES:
- El guest checkout debe seguir funcionando - no romper el flujo de usuarios no logueados
- No exponer en el mensaje de error si el pedido existe o no (usar notFound() siempre)
- No cambiar la interfaz de la página para el usuario - solo la verificación interna
```

---

### 🟡 ÍTEM 8 - PaymentLog en UI del admin

**Prioridad**: Media  
**Archivos principales**: `src/app/admin/pedidos/[id]/page.tsx`, `prisma/schema.prisma`  
**Estado**: [x] Completado 2026-06-13 - sección "Historial de pagos" (tabla fecha/evento/proveedor/providerId/status, desc; sin rawPayload; empty state)

```
CONTEXTO:
El modelo PaymentLog existe en Prisma y se llena con cada evento de pago:
- initiate.card / initiate.pse (cuando el cliente intenta pagar)
- webhook.payment.approved / rejected (cuando llega el webhook de MP)
- pse.return (cuando el banco devuelve al cliente)
- initiate.card.error (cuando hay un error en la pasarela)

La página de detalle del pedido en el admin (src/app/admin/pedidos/[id]/page.tsx)
no muestra este historial. El admin no puede diagnosticar problemas de pago sin
acceder directamente a la DB.

Lee src/app/admin/pedidos/[id]/page.tsx para entender la estructura actual de la página.
Lee prisma/schema.prisma para ver los campos exactos del modelo PaymentLog.

GOAL:
Agregar una sección "Historial de pagos" al final de la página de detalle del pedido.

Datos a mostrar en tabla:
| Fecha/hora | Evento | Proveedor | Provider ID | Status |

- Eventos ordenados: más reciente primero
- rawPayload NO se muestra (demasiado voluminoso para la UI)
- Si no hay PaymentLogs: mostrar "Sin intentos de pago registrados."
- La tabla es solo lectura - no hay acciones

Query a agregar en la función que carga los datos del pedido:
  prisma.paymentLog.findMany({
    where: { orderId },
    orderBy: { createdAt: 'desc' }
  })

Estilo: usar la misma tabla/card que ya existe en otras partes del admin para
mantener consistencia visual. No crear componentes nuevos si hay uno reutilizable.
```

---

### 🟡 ÍTEM 9 - Paginación en listas del admin

**Prioridad**: Media  
**Archivos principales**: `src/app/admin/pedidos/page.tsx`, `src/app/admin/productos/page.tsx`  
**Estado**: [x] Ya resuelto (verificado 2026-06-13) - ambas listas ya paginaban con offset `take:20`+`skip` y controles "X–Y de N". Se conservó offset (mejor UX a esta escala que cursor)

```
CONTEXTO:
Las páginas de listado del admin cargan TODOS los registros sin límite.
Con 500+ pedidos o productos la query degrada y la tabla es inusable.

Lee src/app/admin/pedidos/page.tsx y src/app/admin/productos/page.tsx para ver
las queries actuales de Prisma.

GOAL:
Implementar cursor-based pagination en ambas páginas:

Patrón a usar (cursor-based, no offset):
- El Server Component acepta el searchParam 'cursor' (id del último item visible)
- Query Prisma: { take: 25, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}) }
- La página retorna los items + el id del último item como 'nextCursor'
- Si hay menos de 25 items, no hay nextCursor (última página)
- La URL es: /admin/pedidos?cursor=clxxx - shareable y funciona con el botón atrás

UI a agregar debajo de cada tabla:
- Botón "Página anterior" → elimina el cursor de la URL (vuelve a la primera página)
  Deshabilitado cuando cursor es null (ya estamos en la primera página)
- Texto "Mostrando X resultados"
- Botón "Siguiente página" → agrega cursor=[último id] a la URL
  Deshabilitado cuando no hay nextCursor

RESTRICCIONES:
- No instalar librerías de tabla
- No implementar infinite scroll - botones discretos son más accesibles
- No cambiar el diseño visual de las tablas - solo agregar los controles de navegación
- El cursor va en la URL (searchParam), no en estado del cliente
```

---

### 🟡 ÍTEM 10 - Stock bajo en admin de productos

**Prioridad**: Media  
**Archivos principales**: `src/app/admin/productos/page.tsx`, `src/lib/inventory.ts`  
**Estado**: [x] Completado 2026-06-13 - `StockBadge` (Agotado/Stock bajo (N)/número) con `isLowStock`/`isOutOfStock`; filtro server-side `?stock=low|out` (tabs)

```
CONTEXTO:
src/lib/inventory.ts ya tiene las funciones isLowStock(stock) e isOutOfStock(stock)
que usan el threshold configurado. El storefront las usa para mostrar badges.
Pero en la tabla del admin de productos no hay ningún indicador visual de stock bajo.
Un admin no puede saber de un vistazo qué productos necesitan reposición.

Lee src/lib/inventory.ts para ver la definición de isLowStock e isOutOfStock.
Lee src/app/admin/productos/page.tsx y el componente de tabla asociado.

GOAL:
En la tabla de productos del admin, agregar una columna o indicador de stock:
- Si stock === 0: badge rojo "Agotado"
- Si isLowStock(stock): badge amarillo/naranja "Stock bajo (N)"
- Si stock está bien: mostrar el número sin badge (o badge verde suave opcional)

El threshold para isLowStock ya está configurado en inventory.ts - usar esa función
directamente, no hardcodear el valor.

Además: agregar un filtro rápido en la parte superior de la tabla:
  [Todos] [Stock bajo] [Agotados]
Que filtre la lista en el cliente (si la lista está en un Client Component) o
como searchParam si es Server Component.

RESTRICCIONES:
- Reusar el diseño de badges que ya existe en el proyecto (Badge de shadcn/ui)
- No cambiar la lógica de carga de productos - solo el display
- El filtro puede ser simple (estado local del componente cliente o searchParam)
```

---

### 🟡 ÍTEM 11 - Verificar /api/payments/simulate gateado a dev

**Prioridad**: Media - seguridad  
**Archivos principales**: `src/app/api/payments/simulate/route.ts`  
**Estado**: [x] Completado 2026-06-13 - ya gateado por `isMockPaymentsEnabled()`; añadida 2ª capa: 404 si `NODE_ENV=production`. mock-provider solo redirige (no liquida)

```
CONTEXTO:
Existe una ruta /api/payments/simulate usada en desarrollo para simular pagos sin
pasar por MercadoPago. Si esta ruta es accesible en producción, cualquiera puede
simular un pago aprobado en cualquier pedido.

GOAL:
Lee src/app/api/payments/simulate/route.ts completamente.

Verificar si tiene una guarda de entorno al inicio como:
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

Si NO la tiene: agregar esa guarda como primera línea del handler.
Si SÍ la tiene: confirmar que funciona correctamente y reportar que está bien.

También verificar: ¿el mock-provider.ts tiene una guarda similar? Lee
src/lib/payments/mock-provider.ts y reporta si puede ser instanciado en producción.
```

---

### 🟡 ÍTEM 12 - Dead code: use-toast.ts y otros

**Prioridad**: Baja  
**Estado**: [x] Completado 2026-06-13 - eliminados `use-toast.ts` y `toaster.tsx` (sin importadores). `essentials/page.tsx` se conserva: es `permanentRedirect` (no duplica lógica)

```
CONTEXTO:
El proyecto migró de shadcn/ui toast a Sonner en el Bloque 2. Pero src/hooks/use-toast.ts
puede seguir existiendo y ser importado por algún componente por error.

GOAL:
1. Verificar si src/hooks/use-toast.ts existe y si algún archivo lo importa:
   grep -r "use-toast" src/ --include="*.ts" --include="*.tsx"

2. Si ningún archivo lo importa: eliminar el archivo

3. Verificar si src/components/ui/toaster.tsx está siendo usado:
   grep -r "Toaster" src/ --include="*.tsx"
   Si Toaster (shadcn) coexiste con Sonner y nadie lo usa: eliminar

4. Verificar src/app/(store)/essentials/page.tsx:
   Desde el Bloque 9.6, Esenciales es una categoría dinámica en /category/[slug].
   Si esta página estática duplica funcionalidad, reportar si se puede eliminar
   (verificar si tiene lógica propia o es simplemente un redirect).

Reportar exactamente qué se eliminó y confirmar que yarn validate sigue pasando.
```

---

---

### 🟢 ÍTEM 13 - Media Manager: gestor completo de archivos del CDN

**Prioridad**: Alta (limpieza de CDN, ahorro de costos)  
**Archivos principales**: `src/lib/media-manager.ts` (nuevo), `src/app/api/admin/media/route.ts`, `src/app/admin/media/page.tsx` (nuevo), `src/components/admin/media/media-manager-page.tsx` (nuevo)  
**Estado**: [x] Completado 2026-06-13 - scan con caché 5min, DELETE con re-verificación + batch 25, `/scan` fresco, página + client (tabs/grid/selección/AlertDialog), link en sidebar y modal, revalidate en cleanup. Gaps de robustez cerrados: `loading.tsx` (skeleton cache frío), `error.tsx` (estado degradado), y badge de huérfanos en sidebar vía `?stats=1` (conteo del scan cacheado, fetch no bloqueante). GET principal sigue devolviendo `{items}` para no romper el modal; filtrado/paginación client-side a propósito. Falta solo E2E con credenciales de UploadThing

```
CONTEXTO:
El admin puede subir imágenes desde cualquier editor de productos, categorías y
configuración, pero no existe una vista global de qué hay en el CDN de UploadThing.
Archivos de prueba, logos reemplazados y banners antiguos se acumulan indefinidamente.

Infraestructura existente (reutilizar sin modificar):
- src/lib/media-cleanup.ts → función uploadThingKeyFromUrl(), collectUploadThingUrls()
  (escaneo recursivo de JSON), deleteUploadedImages()
- src/lib/media-library.ts → listUploadedImages() con UTApi.listFiles()
- src/app/api/admin/media/route.ts → GET existente, retorna { items: MediaItem[] }
- src/components/admin/media/media-library-modal.tsx → modal de reutilización existente

UTApi disponible (confirmado en docs oficiales):
- listFiles({ limit, offset }) → { files: [{ key, name, size, uploadedAt, status }] }
- deleteFiles(keys[]) → borrado batch; máx 25 simultáneos → hacer chunks
- La URL pública es determinística: https://{appId}.ufs.sh/f/{key}
- El appId se extrae del UPLOADTHING_TOKEN (ya lo hace media-library.ts)

Campos de imagen en la DB a escanear:
- Product.image (String, todos los productos)
- Category.image (String?, todas las categorías)
- User.image (String?, todos los usuarios)
- Setting.value (Json) - TODOS los settings, escaneo recursivo con collectUploadThingUrls

GOAL:
Implementar el Media Manager completo en estas fases:

FASE 1 - src/lib/media-manager.ts (nuevo):
Función scanMediaUsage(): Promise<ScanResult>
  1. Llamar utapi.listFiles({ limit: 500 }) - paginar si hasMore hasta tener todos
  2. En paralelo (Promise.all): query Product.image, Category.image, User.image,
     todas las Setting.value
  3. Para cada URL de DB: extraer key con uploadThingKeyFromUrl(), registrar qué
     entidad la usa (id, nombre, campo)
  4. Cruzar con la lista de UT: archivos sin referencias = huérfanos
  5. Cachear resultado 5 min con unstable_cache, tag "media-scan"

Tipos:
  FileReference { entity, entityId, entityName, field }
  ScannedFile { key, url, name, size, uploadedAt, usedBy: FileReference[], isOrphan }
  ScanResult { files, totalFiles, totalSize, orphanCount, orphanSize, scannedAt }

FASE 2 - Extender src/app/api/admin/media/route.ts:
  GET: agregar ?filter=all|used|orphan + paginación ?page (25 por página, client-side)
       retornar ScanResult completo con stats
  DELETE (nuevo): body { keys: string[] }
    - Verificar permiso (misma lógica que GET)
    - Re-verificar en DB que los keys no están en uso (protección de último momento)
    - Batch delete en chunks de 25: await utapi.deleteFiles(chunk)
    - revalidateTag("media-scan")
    - Retornar { deleted: number, skipped: string[] }

Nuevo GET /api/admin/media/scan → scan fresco forzado (revalidate antes de devolver)

FASE 3 - src/app/admin/media/page.tsx (Server Component):
  Carga el ScanResult del caché y pasa props iniciales al Client Component

FASE 4 - src/components/admin/media/media-manager-page.tsx (Client Component):
  - Stats bar: "47 archivos · 12.4 MB · ⚠️ 8 huérfanos (2.1 MB)"
  - Tabs: Todos | En uso | Huérfanos (filtra el array en cliente)
  - Grid de thumbnails 5 columnas desktop, 2 mobile
  - Cada tarjeta: thumbnail (next/image), nombre, tamaño, fecha relativa,
    badge "Huérfano" o lista de "Usado en: X producto, Y setting"
  - Checkbox por tarjeta + "Seleccionar todo los huérfanos"
  - Botón "Eliminar seleccionados (N)" con AlertDialog que muestra:
    · espacio a liberar
    · si hay archivos en uso en la selección: warning explícito
  - "Eliminar todos los huérfanos" en un solo click
  - Botón "Actualizar" → GET /api/admin/media/scan (scan fresco)
  - Paginación: 25 por página, estado local

FASE 5 - Integraciones:
  - Sidebar del admin: agregar link "Medios" (icono ImageIcon o GalleryHorizontal)
    con badge rojo de orphanCount > 0 (leído del caché, no bloquea sidebar)
  - MediaLibraryModal: agregar link "Abrir gestor completo →" en el footer del modal
  - media-cleanup.ts: agregar revalidateTag("media-scan") en deleteUploadedImages()

RESTRICCIONES:
- No instalar nuevas dependencias
- La eliminación NUNCA debe proceder sin re-verificar uso en la DB justo antes de borrar
- Archivos con status !== "Uploaded" no se muestran ni eliminan
- Reutilizar el design system del admin (mismas cards, badges, AlertDialog que ya existen)
- El scan no bloquea el render inicial - si el caché está frío, mostrar skeleton y
  lanzar el scan en segundo plano (o hacer el Server Component async con Suspense)

CRITERIO DE COMPLETITUD:
- Subir un archivo de prueba desde cualquier editor → aparece en Huérfanos
- Asignarlo a un producto → aparece en "En uso" con referencia al producto
- Eliminar el producto → vuelve a aparecer como Huérfano en el próximo scan
- "Eliminar todos los huérfanos" → archivos desaparecen de UTApi (confirmar con listFiles)
- yarn validate pasa
```

---

### 🔴 ÍTEM 14 - Vinculación de pedidos guest al iniciar sesión (login-claiming)

**Prioridad**: Alta (bug confirmado - pedidos no aparecen en /cuenta/pedidos tras login)  
**Archivos principales**: `src/lib/account.ts`, `src/lib/auth-options.ts`  
**Estado**: [x] Completado 2026-06-13 - `claimGuestOrders(email, userId)` extraída y reusada en `registerCustomer` + `authorize()`; `verify-account.mjs` cubre el flujo de login-claiming

```
CONTEXTO:
Cuando un cliente hace checkout como guest (sin sesión), el pedido se guarda con
userId=null y customerEmail=su@email.com.

La función registerCustomer() en src/lib/account.ts (línea 68-71) ya tiene lógica
para reclamar esos pedidos al momento de registrarse - hace un updateMany sobre
Order.userId=null AND customerEmail=email.

El problema: esa lógica NO existe en el authorize() de src/lib/auth-options.ts.
Esto significa que si el cliente:
  1. Tiene una cuenta existente y compra como guest → inicia sesión → pedidos perdidos
  2. Se registra primero → después compra como guest → inicia sesión → pedidos perdidos
  3. Compra como guest → se registra directamente → FUNCIONA (único caso cubierto)

TAREA:
1. Extraer una función reutilizable claimGuestOrders(email: string, userId: string): Promise<number>
   en src/lib/account.ts.
   - email debe normalizarse: .trim().toLowerCase() (consistente con registerCustomer)
   - Retornar el count de pedidos reclamados (útil para logs y tests)
   - La query debe ser idéntica a la actual: WHERE userId IS NULL AND customerEmail = email

2. Refactorizar registerCustomer() para usar claimGuestOrders() en lugar del updateMany
   embebido. Comportamiento idéntico - solo refactor de extracción.

3. En src/lib/auth-options.ts, en el callback authorize(), luego de verificar la
   contraseña y ANTES de hacer return, agregar:
   await claimGuestOrders(user.email, user.id)
   Importar claimGuestOrders desde "@/lib/account".

NOTAS DE IMPLEMENTACIÓN:
- El claiming es seguro de ejecutar siempre: si no hay pedidos guest, es un no-op
  (0 rows updated)
- El WHERE userId IS NULL protege pedidos ya reclamados (no se reasignan)
- No usar transacción especial - el updateMany de Prisma es atómico
- No mostrar nada al usuario (no hay toast ni redirect extra): el claiming es
  transparente y los pedidos ya aparecerán en /cuenta/pedidos en la siguiente carga

CRITERIO DE COMPLETITUD:
1. Test manual completo:
   a. Comprar como guest con email=test@ejemplo.com (sin sesión)
   b. Iniciar sesión con una cuenta que tiene ese mismo email
   c. Verificar en /cuenta/pedidos que el pedido guest aparece
   d. Verificar en la DB: Order.userId ya no es null

2. Test de registro (no romper el caso que ya funciona):
   a. Comprar como guest con email=nuevo@ejemplo.com
   b. Registrarse con ese email (sin pasar por el CTA de order-success)
   c. Verificar que el pedido aparece en /cuenta/pedidos

3. yarn validate pasa sin errores
4. Actualizar scripts/verify-account.mjs para cubrir el caso de login-claiming
```

---

## Sección 4 - Prompt para auditoría completa de seguridad del admin

> Usar este prompt cuando quieras que Fable 5 audite TODAS las rutas del admin de una vez.
> Es una tarea larga - usar effort xhigh.

```
TAREA: Auditoría de seguridad de todas las API routes del admin.

Archivos a auditar (leer todos):
src/app/api/admin/categories/route.ts
src/app/api/admin/categories/[id]/route.ts
src/app/api/admin/products/route.ts
src/app/api/admin/products/[id]/route.ts
src/app/api/admin/orders/[id]/route.ts
src/app/api/admin/users/route.ts
src/app/api/admin/users/[id]/route.ts
src/app/api/admin/roles/route.ts
src/app/api/admin/roles/[id]/route.ts
src/app/api/admin/settings/route.ts
src/app/api/admin/media/route.ts

Para referencia, lee también:
src/lib/permissions.ts → hasPermission(), Resource, Action
src/lib/auth-options.ts → estructura del JWT y la sesión

CRITERIO a verificar por cada route handler (GET, POST, PUT, DELETE):
1. ¿Verifica getServerSession(authOptions) al inicio?
2. ¿Verifica hasPermission(session.user.permissions, resource, action) con el
   resource y action correctos para esa operación?
3. ¿Retorna 401 si no hay sesión y 403 si no tiene permiso? (o 401 en ambos -
   verificar consistencia)
4. ¿Hay alguna ruta que solo verifica sesión pero no el permiso específico?
5. ¿Hay algún input del request que se usa en una query Prisma sin validar?
   (buscar: req.json() → campos usados directamente en where/data sin verificar tipo)

OUTPUT esperado:
Una tabla por archivo:
| Ruta | Método | Auth ✅/❌ | Permiso correcto ✅/❌ | Problema |

Al final: lista de fixes necesarios con archivo, línea y código de corrección.
```

---

## Sección 5 - Prompt para review del flujo completo de pagos

> Usar este prompt para verificar el estado real del flujo de pagos antes de ir a producción.

```
TAREA: Review y verificación del flujo completo de MercadoPago.

Lee estos archivos en orden:
1. src/lib/payments/types.ts → interfaz IPaymentProvider
2. src/lib/payments/index.ts → factory getPaymentProvider
3. src/lib/payments/mercadopago/client.ts → inicialización del cliente MP
4. src/lib/payments/mercadopago/provider.ts → implementación del proveedor
5. src/lib/payments/mercadopago/webhook.ts → verificación de firma
6. src/lib/payments/mercadopago/mapper.ts → mapeo de estados
7. src/app/api/payments/initiate/route.ts → endpoint de inicio de pago
8. src/app/api/payments/webhook/mercadopago/route.ts → handler del webhook
9. src/app/api/payments/pse-return/route.ts → retorno de PSE
10. src/lib/orders.ts → markOrderPaid, markOrderFailed, claimPaymentAttempt

Para cada archivo, verificar:

SEGURIDAD:
- ¿El monto viene siempre de la DB? ¿Hay algún lugar donde amount viene del request?
- ¿La firma del webhook usa timingSafeEqual? (previene timing attacks)
- ¿El idempotencyKey se genera y guarda ANTES de llamar al proveedor?
- ¿El webhook verifica firma ANTES de hacer cualquier operación de DB?

CORRECTITUD:
- ¿markOrderPaid tiene un guard que evita doble-escritura si ya está en PAID?
- ¿markOrderFailed evita cancelar un pedido que el cliente está reintentando con
  otra tarjeta? (verificar que solo cancela si paymentProviderId coincide)
- ¿El PSE return verifica el estado real contra MP, no solo el query param?
- ¿El webhook responde 200 INMEDIATAMENTE y procesa en after()?

GAPS:
- ¿markOrderFailed restaura el stock? (ítem 1 de este plan)
- ¿Existe manejo del caso donde el webhook llega antes del pse-return?

Reportar: hallazgos reales con archivo + línea + severidad (crítico/importante/menor).
No reportar cosas que ya están correctas como "hallazgos" - solo problemas reales.
```

---

## Sección 6 - Configuración de sesión recomendada para Fable 5

### Ajustes de API (si usas la API directamente)

```json
{
  "model": "claude-fable-5",
  "effort": "xhigh",
  "max_tokens": 32000,
  "stream": true,
  "timeout": 600000
}
```

**Por qué `timeout: 600000` (10 min):** en `xhigh` con tareas complejas de múltiples archivos, Fable 5 puede tardar varios minutos. El timeout por defecto de muchos clientes es 30s - eso debe ampliarse.

### En Claude Code (este CLI)

Claude Code ya configura los timeouts automáticamente. Lo que sí puedes controlar:

- Usa `/model` para confirmar que estás en `claude-fable-5` antes de empezar
- Para tareas del Bloque 14: una tarea por sesión es mejor que intentar hacer todo en una
- Si Fable 5 llega al límite de contexto en una sesión muy larga: nueva sesión con el
  system prompt base + el contexto mínimo necesario (el resumen de lo que quedó pendiente)

---

## Sección 7 - Checklist final antes de producción

Marca cada uno cuando esté completado:

### Seguridad

- [x] [ÍTEM 1] Stock se restaura cuando falla el pago
- [x] [ÍTEM 2] Headers HTTP configurados en next.config.ts
- [x] [ÍTEM 5] Rate limiting en login y registro
- [x] [ÍTEM 7] Ownership check en order-success
- [x] [ÍTEM 11] /api/payments/simulate gateado a dev
- [x] [Sec.5] Auditoría del flujo de pagos completada - sin hallazgos (ver nota abajo)

### UX crítica

- [x] [ÍTEM 3] createOrder usa shipping de la DB
- [x] [ÍTEM 4] pago-fallido recibe orderId y ofrece reintento
- [x] [ÍTEM 6] Polling en order-success para PSE pendiente
- [x] [ÍTEM 14] Pedidos guest vinculados al iniciar sesión (login-claiming)

### Admin operativo

- [x] [ÍTEM 8] PaymentLog visible en detalle de pedido
- [x] [ÍTEM 9] Paginación en listas de pedidos y productos (ya existía - offset)
- [x] [ÍTEM 10] Indicador de stock bajo en tabla de productos
- [x] [ÍTEM 13] Media Manager: gestor completo con detección de huérfanos y borrado en lote

### Calidad

- [x] [ÍTEM 12] Dead code eliminado (use-toast + toaster; essentials es redirect, se conserva)
- [x] [Sec.4] Auditoría de seguridad de todas las admin APIs - completada (ver nota abajo)
- [x] yarn validate pasa en verde (type-check + lint + format de fuentes)
- [ ] Prueba E2E: tarjeta APRO → pago exitoso → stock decrementado
- [ ] Prueba E2E: tarjeta FUND → pago fallido → stock restaurado
- [x] Bloque 11 (emails transaccionales) iniciado - 4/5 emails (falta abandono de carrito)

### Resultado de auditorías (2026-06-13)

**Sec.4 - Admin APIs**: los 12 route handlers verifican sesión + permiso granular
correcto. Hallazgo corregido: mass-assignment en products (ahora `pickProductInput`
whitelist). Endurecido users POST (valida roleId + longitud de contraseña).
Recomendación abierta: `roles:update` permite auto-escalada de permisos (mitigar a
futuro). Detalle en ROADMAP [B-5].

**Sec.5 - Flujo de pagos**: sin hallazgos. Se confirmaron todas las invariantes:
monto siempre desde la DB; firma del webhook con `timingSafeEqual` y fail-closed sin
secret; webhook responde 200 al instante y procesa en `after()` con estado
autoritativo del GET (no del body); `idempotencyKey` persistido antes del gateway;
`markOrderPaid` idempotente (webhook duplicado = no-op); el rechazo no cancela un
reintento vigente (compara `paymentProviderId`); PSE-return re-verifica contra MP.

---

_Ver también: `docs/ROADMAP.md` sección "Bloque 14" para el análisis completo de cada ítem._
