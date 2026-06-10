# Guía de configuración manual — MercadoPago

> Pasos manuales para activar los pagos reales del Bloque 10 (código ya
> implementado y verificado: `yarn verify:payments`, 15/15). Corroborado con la
> documentación oficial de MercadoPago Colombia.
>
> - Panel: https://www.mercadopago.com.co/developers/panel/app
> - Credenciales: https://www.mercadopago.com.co/developers/es/docs/your-integrations/credentials
> - Webhooks: https://www.mercadopago.com.co/developers/es/docs/your-integrations/notifications/webhooks
> - Tarjetas de prueba: https://www.mercadopago.com.co/developers/es/docs/checkout-api-payments/additional-content/your-integrations/test/cards

---

## Fase 1 — Crear la aplicación en MercadoPago

1. Crea (o usa) una cuenta de MercadoPago Colombia en [mercadopago.com.co](https://www.mercadopago.com.co)
2. Entra a [mercadopago.com.co/developers](https://www.mercadopago.com.co/developers/es) → **Tus integraciones** (arriba a la derecha)
3. **Crear aplicación**:
   - Nombre: ej. "Dulce Infancia Shop"
   - Tipo de solución: **Pagos online**
   - Plataforma: **CheckoutAPI** (no Checkout Pro — la integración es API con CardForm)

---

## Fase 2 — Credenciales de prueba

> **Organización de archivos env**: `.env` guarda solo `DATABASE_URL` (es el
> único archivo que lee Prisma CLI). Todo lo demás —auth, pagos, URLs— vive en
> `.env.local`, que tiene prioridad sobre `.env` en Next.js. No pongas
> comentarios en la misma línea del valor; usa líneas separadas.

1. En tu aplicación → menú izquierdo → **Credenciales de prueba**
   (disponibles automáticamente, no requieren activación)
2. Copia los dos valores a tu `.env.local`:

```bash
PAYMENT_PROVIDER=mercadopago
# Access Token de prueba (solo servidor)
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxx...
# Public Key de prueba (SDK frontend)
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-xxxx...
```

> ⚠️ El código rechaza tokens `APP_USR-` (producción) en desarrollo — es un
> guard intencional en `src/lib/payments/mercadopago/client.ts`. En dev solo
> funcionan los `TEST-`.

---

## Fase 3 — Configurar el webhook

El webhook necesita una **URL pública** — MP no acepta `localhost`. Para desarrollo:

1. Expón tu local: `ngrok http 3000` (o `cloudflared tunnel`) → te da `https://abc123.ngrok.io`
2. En el panel: tu aplicación → **Webhooks → Configurar notificaciones**
3. **Modo prueba**: URL = `https://abc123.ngrok.io/api/payments/webhook/mercadopago`
4. Eventos: marca solo **Pagos** (`payment`)
5. **Guardar** → el panel genera la **clave secreta** → cópiala:

```bash
MERCADOPAGO_WEBHOOK_SECRET=tu-clave-secreta-del-panel
```

> ⚠️ Sin esta variable el endpoint rechaza todo con 503 (fail closed, por
> diseño). Si regeneras la clave en el panel, actualiza el `.env.local`.

6. Verifica con el botón **Simular** del panel: elige la URL de prueba, evento
   `payment`, un ID cualquiera → debe responder 200 (o 401 si la firma no
   corresponde — eso también confirma que la verificación funciona).

---

## Fase 4 — Cuentas de prueba (recomendado para PSE)

Para probar el flujo completo como lo vería un cliente:

1. Tu aplicación → **Cuentas de prueba** → **+ Crear cuenta de prueba**
2. Crea **dos**: una _Vendedor_ y una _Comprador_
   - País: Colombia (no se puede cambiar después)
   - Máximo 15 cuentas; no se pueden borrar
3. A la de comprador agrégale saldo ficticio
4. Para el flujo más fiel: inicia sesión con la cuenta vendedor de prueba en una
   ventana de incógnito, crea una aplicación ahí y usa _sus_ credenciales — así
   compras con la cuenta compradora de prueba contra el vendedor de prueba

> Para tarjetas, con las credenciales TEST de tu cuenta real basta. Las cuentas
> de prueba importan más para PSE y la billetera MP.

---

## Fase 5 — Probar en sandbox

**Antes de empezar:**

1. `yarn verify:payments` → 15/15 (sanity check sin tocar MP real)
2. Arranca el túnel: `ngrok http 3000` → copia la URL `https://xxxx.ngrok-free.app`
3. En `.env.local` pon `NEXT_PUBLIC_APP_URL=https://xxxx.ngrok-free.app`
   (PSE y `notification_url` necesitan URL pública; para solo tarjetas basta localhost)
4. En el panel MP → Webhooks → modo prueba: apunta a
   `https://xxxx.ngrok-free.app/api/payments/webhook/mercadopago` y verifica que
   `MERCADOPAGO_WEBHOOK_SECRET` sea la clave vigente del panel
5. **Reinicia `yarn dev`** — las variables `NEXT_PUBLIC_*` se congelan al arrancar

Haz una compra en `/checkout-flow`. En `/pago/[orderId]` usa las tarjetas
oficiales de prueba:

| Tarjeta     | Número              | CVV | Vence |
| ----------- | ------------------- | --- | ----- |
| Mastercard  | 5254 1336 7440 3564 | 123 | 11/30 |
| Visa        | 4013 5406 8274 6260 | 123 | 11/30 |
| Visa débito | 4915 1120 5524 6507 | 123 | 11/30 |

El **resultado lo controla el nombre del titular**:

| Titular | Resultado                   |
| ------- | --------------------------- |
| `APRO`  | Aprobado                    |
| `FUND`  | Fondos insuficientes        |
| `SECU`  | CVV inválido                |
| `CONT`  | Pendiente                   |
| `CALL`  | Rechazo, llamar a autorizar |
| `OTHE`  | Error general               |
| `EXPI`  | Tarjeta vencida             |
| `LOCK`  | Tarjeta bloqueada           |
| `DUPL`  | Pago duplicado              |

Documento: `123456789` · Email: usa el del **comprador de prueba**
(`TESTUSER...@testuser.com`) o cualquiera distinto al de tu cuenta MP — si
coincide con el email del vendedor, MP rechaza el pago.

**Para PSE**: selecciona cualquier banco; en sandbox MP muestra un banco
ficticio donde eliges aprobar/rechazar. Al volver, el pedido queda "Pago en
proceso" hasta que el webhook (vía ngrok) lo asiente — verifica en la terminal
de ngrok que llegue el POST a `/api/payments/webhook/mercadopago`.

**Qué verificar en cada prueba:**

- [ ] `APRO` → redirige a `/order-success`, pedido **Pagado** en `/admin/pedidos`
- [ ] `FUND` → mensaje "La tarjeta no tiene fondos suficientes", el pedido sigue
      pendiente y se puede reintentar
- [ ] PSE → lleva al banco de prueba de MP; al volver el estado queda "Pago en
      proceso" hasta que llegue el webhook
- [ ] El detalle del pedido en admin muestra el estado de pago correcto
- [ ] La tabla `PaymentLog` registra cada evento (gateway y webhook)

---

## Fase 6 — Pasar a producción

1. **Activar credenciales productivas**: panel → **Credenciales de producción**
   → completa industria, URL del sitio, acepta términos + reCAPTCHA. Puede
   requerir verificación de identidad/datos del negocio (homologación).
2. En el `.env` del servidor de producción (Vercel/hosting):

```bash
PAYMENT_PROVIDER=mercadopago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxx...
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxx...
MERCADOPAGO_WEBHOOK_SECRET=...   # el del modo PRODUCCIÓN (distinto al de prueba)
NEXT_PUBLIC_APP_URL=https://dulceinfancia.co
```

3. **Webhook de producción**: en el panel agrega la URL productiva
   `https://dulceinfancia.co/api/payments/webhook/mercadopago`
   (el modo producción genera/usa su propia clave secreta)
4. **Migración en la DB de producción**: `npx prisma migrate deploy`
5. **Compra real de bajo monto** con una tarjeta tuya para validar el ciclo
   completo (cobro + webhook + estado en admin), y reembólsala desde el panel
6. Activa notificaciones de **contracargos** (chargebacks) en el panel para
   enterarte de disputas

### Checklist final de producción

- [ ] `MERCADOPAGO_ACCESS_TOKEN` empieza con `APP_USR-`
- [ ] Webhook registrado apuntando al dominio de producción
- [ ] `MERCADOPAGO_WEBHOOK_SECRET` de producción configurado (no regenerar después)
- [ ] `prisma migrate deploy` aplicado (incluye `idempotencyKey @unique` y `PaymentLog`)
- [ ] Compra real de prueba completada y reembolsada
- [ ] `/api/payments/webhook/mercadopago` accesible sin sesión (el middleware ya
      lo excluye — no agregar `/api` al matcher)
- [ ] `PaymentLog` registró la primera transacción real
- [ ] Notificaciones de contracargos activadas

---

## Pendientes opcionales (no bloquean el lanzamiento)

- **Emails transaccionales** (Bloque 11): hoy nadie recibe correo al
  confirmarse el pago. El webhook ya tiene el punto de enganche para dispararlos.
- **Cuotas / installments**: el CardForm ya muestra cuotas; revisa en el panel
  de MP la configuración de costos de financiación.
- **Wompi (Bloque 10.5) y Stripe (Bloque 10.6)**: planeados en el ROADMAP; se
  activarán con `PAYMENT_PROVIDER=wompi|stripe` cuando se implementen.

---

## Verificación sin credenciales (ya disponible)

```bash
yarn verify:payments   # E2E 15/15 — usa un mock del API de MP, no toca MP real
```

Y para demos sin pasarela: `PAYMENT_PROVIDER=mock` activa el simulador de pago
interno en `/pago/[orderId]`.

---

> **Resumen mínimo para empezar hoy**: Fases 1–3 (app + credenciales TEST +
> webhook con ngrok) te dejan probando pagos de sandbox en ~20 minutos. El
> resto puede esperar al momento del lanzamiento.
