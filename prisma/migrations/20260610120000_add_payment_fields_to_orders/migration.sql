-- Extend PaymentStatus with the async-gateway states.
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'PROCESSING';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'REFUNDED';

-- paymentRef becomes paymentProviderId (same meaning, clearer name) - rename
-- instead of drop/add so existing references survive.
ALTER TABLE "Order" RENAME COLUMN "paymentRef" TO "paymentProviderId";

ALTER TABLE "Order" ADD COLUMN "paymentProvider" TEXT;
ALTER TABLE "Order" ADD COLUMN "idempotencyKey" TEXT;
ALTER TABLE "Order" ADD COLUMN "pseRedirectUrl" TEXT;
ALTER TABLE "Order" ADD COLUMN "paymentAttempts" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");

-- Append-only audit trail of gateway responses and webhook deliveries.
CREATE TABLE "PaymentLog" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "providerId" TEXT,
    "status" TEXT NOT NULL,
    "rawPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PaymentLog_orderId_idx" ON "PaymentLog"("orderId");

ALTER TABLE "PaymentLog" ADD CONSTRAINT "PaymentLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
