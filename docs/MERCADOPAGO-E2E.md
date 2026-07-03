# Runbook E2E - MercadoPago sandbox

> Cómo ejecutar y verificar el flujo de pago real de punta a punta en sandbox.
> Complementa `MERCADOPAGO-SETUP.md` (que cubre crear la app, credenciales y el
> webhook). Aquí ya asumimos esos pasos hechos y nos enfocamos en **correr la
> prueba** y **verificar el resultado**.
>
> Toda la verificación se hace desde el admin: `/admin/productos` (badge de stock)
> y `/admin/pedidos/[id]` (estado de pago + sección "Historial de pagos").

---

## 0. Requisitos previos (checklist)

- [ ] `MERCADOPAGO-SETUP.md` Fases 1–3 completas (app creada, credenciales `TEST-`,
      webhook configurado en el panel).
- [ ] `.env.local` con:
  ```bash
  PAYMENT_PROVIDER=mercadopago
  MERCADOPAGO_ACCESS_TOKEN=TEST-...
  NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-...
  MERCADOPAGO_WEBHOOK_SECRET=...        # el que generó el panel en "modo prueba"
  # NEXT_PUBLIC_APP_URL se ajusta en el paso 2 (debe ser la URL pública de ngrok)
  ```
- [ ] `ngrok` instalado (`brew install ngrok` o https://ngrok.com/download).
- [ ] Node 22 activo para el server (`nvm use 22`). Prisma v7 no corre en Node 18.
- [ ] Un producto **publicado** con stock conocido y > 1 (anota el número; lo
      verás en `/admin/productos`). Ejemplo: stock = 10.

---

## 1. Levantar el stack

**Terminal A - servidor** (puerto 3000):

```bash
nvm use 22
yarn dev          # next dev --turbopack en http://localhost:3000
```

**Terminal B - túnel público** (MP no acepta `localhost` para el webhook):

```bash
ngrok http 3000
```

ngrok imprime una URL tipo `https://abc123.ngrok-free.app`. Cópiala.

---

## 2. Apuntar la app y el webhook al túnel

El `notification_url` que recibe MercadoPago se construye desde
`NEXT_PUBLIC_APP_URL`. Para que el webhook llegue de vuelta a tu máquina:

1. En `.env.local` cambia:
   ```bash
   NEXT_PUBLIC_APP_URL=https://abc123.ngrok-free.app
   ```
2. **Reinicia `yarn dev`** (las env `NEXT_PUBLIC_*` se hornean al arrancar).
3. En el panel de MP → tu app → **Webhooks**, confirma que la URL de **modo
   prueba** sea:
   `https://abc123.ngrok-free.app/api/payments/webhook/mercadopago`
   (la URL de ngrok cambia en cada reinicio del túnel en el plan free - re-pégala).

> Opcional: el panel tiene un botón **Simular** para enviar un evento de prueba.
> Si la firma está bien, verás `200` en la consola del server y nada de errores.

> **Cómo llega el webhook.** El código adjunta el `notification_url` por-pago solo
> si `NEXT_PUBLIC_APP_URL` es **https pública** (en `localhost` lo omite a propósito:
> MP rechaza el pago entero con error 4020 si la URL no es pública). Pero el webhook
> **configurado en el panel** se entrega igual. Por eso la tarjeta **APRO** se puede
> probar sin ngrok (el CardForm confirma de forma síncrona); ngrok hace falta sobre
> todo para **ver la entrega del webhook** y para **PSE**.

---

## 3. Snapshot inicial

Abre `/admin/productos` y anota el stock del producto de prueba (badge verde con
el número, o "Stock bajo (N)").

---

## 4. Caso A - Tarjeta aprobada (APRO)

1. En el storefront: abre el producto → **Agregar al carrito** → ir al carrito →
   **Checkout**.
2. Llena el envío (cualquier dirección colombiana válida; el código postal es
   opcional) → continuar → método **Tarjeta**.
3. Al llegar a `/pago/[orderId]`, en el CardForm de MP usa una tarjeta de prueba
   con el **nombre del titular = `APRO`**:

   | Campo          | Valor                                   |
   | -------------- | --------------------------------------- |
   | Número         | `5031 7557 3453 0604` (Mastercard test) |
   | Nombre titular | **APRO**                                |
   | Vencimiento    | `11/30`                                 |
   | CVV            | `123`                                   |
   | Doc. (CC)      | cualquiera, ej. `12345678`              |

4. Enviar → debe redirigir a `/order-success/[id]`.

**Verificar:**

- [ ] `/order-success/[id]` muestra "¡Gracias por tu compra!" (estado pagado).
- [ ] `/admin/pedidos/[id]`: badge **Pagado** + estado **Confirmado**.
- [ ] En "Historial de pagos" de ese pedido hay al menos:
      `initiate.card` y `webhook.payment.approved` (el webhook llegó vía ngrok).
- [ ] `/admin/productos`: el stock bajó en la cantidad comprada (10 → 9).

> Si `webhook.payment.approved` **no** aparece pero el pedido sí quedó pagado: la
> aprobación síncrona del CardForm lo confirmó; el webhook es redundante aquí.
> Revisa la consola del server y el "Simular" del panel para validar la entrega.

---

## 5. Caso B - Tarjeta rechazada por fondos (FUND)

Repite el flujo del Caso A con **otro** producto/checkout, pero con el titular
**`FUND`** (mismo número, vencimiento y CVV).

**Verificar:**

- [ ] La página de pago muestra un mensaje amigable tipo "La tarjeta no tiene
      fondos suficientes" (sin exponer el `status_detail` crudo).
- [ ] `/admin/pedidos/[id]`: el pedido sigue en **Pago pendiente** (PENDING), **no**
      en Fallido - es intencional para permitir reintentar con otra tarjeta.
- [ ] "Historial de pagos": aparece `initiate.card` con el detalle del rechazo.
- [ ] ⚠️ **El stock de ese producto siguió descontado.** Esto es correcto: el stock
      se reserva al **crear** el pedido, no al pagar. Mientras el pedido sea
      reintentable (PENDING), la reserva se mantiene.

---

## 6. Caso C - Restauración de stock al cancelar

Esto valida `markOrderFailed()` (el restock idempotente). Usa el pedido del Caso B
(PENDING con stock reservado):

1. `/admin/pedidos/[id]` → cambia el estado a **Cancelado**.

**Verificar:**

- [ ] El pedido queda **Cancelado**.
- [ ] `/admin/productos`: el stock de ese producto **volvió a subir** (se restauró
      la reserva).
- [ ] Cancelarlo de nuevo (o un segundo intento) no vuelve a subir el stock
      (restock idempotente - el guard solo actúa en la primera transición).

> El stock también se restaura automáticamente cuando un **webhook `rejected`** o
> el **retorno de PSE rechazado** liquidan el pedido del intento vigente.

---

## 7. Caso D - PSE (opcional)

> ⚠️ **Limitación conocida del sandbox de MP (verificado 2026-07-03).** PSE con las
> credenciales `APP_USR-` de una cuenta de prueba vendedor devuelve
> `401 "Unauthorized use of live credentials"` (code 7) en `POST /v1/payments` con
> `payment_method_id: pse`. El token autentica bien para `/users/me` y `getBanks`;
> MP bloquea **solo** la creación de pagos PSE porque las cuentas de prueba **no
> están homologadas para recaudar PSE**. No es un bug del código. **PSE solo se puede
> validar de verdad en producción con credenciales reales homologadas.** El resto del
> runbook (Casos A/B/C) cubre todo el motor de pagos; PSE usa el mismo motor.

PSE requiere las credenciales de una **cuenta de prueba vendedor** (`APP_USR-...`),
no tus `TEST-`. Ver `MERCADOPAGO-SETUP.md` Fase 4 y 5b. Resumen:

1. Cambia temporalmente `MERCADOPAGO_ACCESS_TOKEN` y
   `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` por las del vendedor de prueba, reinicia.
2. En el checkout elige **PSE** → banco → datos del pagador → te redirige al banco
   ficticio de MP donde **apruebas o rechazas**.
3. Al volver, `/api/payments/pse-return` consulta el estado real contra MP (no
   confía en el query param) y enruta a `/order-success` o `/pago-fallido?orderId=`.

**Verificar:**

- [ ] Aprobado → pedido **Pagado**, "Historial de pagos" con `pse.return` aprobado.
- [ ] Rechazado → `/pago-fallido?orderId=...` con botón "Intentar de nuevo", pedido
      **Fallido** y stock **restaurado**.

---

## 8. Limpieza

- [ ] Restaura `NEXT_PUBLIC_APP_URL=http://localhost:3000` en `.env.local`.
- [ ] Si cambiaste las credenciales para PSE, vuelve a las `TEST-` tuyas.
- [ ] Marca en `docs/ROADMAP.md` el checklist E2E del Bloque 14 como completado.

---

## Mapa rápido de qué prueba cada caso

| Caso | Valida                                                             |
| ---- | ------------------------------------------------------------------ |
| A    | CardForm + tokenización + confirmación + webhook firmado + stock−  |
| B    | Rechazo limpio, pedido reintentable, reserva de stock se mantiene  |
| C    | `markOrderFailed()` restaura stock (idempotente) al cancelar       |
| D    | PSE async + `pse-return` verificado contra MP + restock en rechazo |

> Tarjetas y montos de prueba oficiales:
> https://www.mercadopago.com.co/developers/es/docs/checkout-api-payments/additional-content/your-integrations/test/cards
