"use client"

import { useEffect, useRef } from "react"
import { trackPurchase, type EcommerceItem } from "@/lib/analytics"

interface PurchaseTrackerProps {
  orderId: string
  total: number
  items: EcommerceItem[]
}

/**
 * Fires the `purchase` analytics event once on the confirmation page. Keyed by
 * order id and guarded so React strict-mode re-mounts don't double-count.
 */
export function PurchaseTracker({ orderId, total, items }: PurchaseTrackerProps) {
  const fired = useRef(false)
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    trackPurchase(orderId, total, items)
  }, [orderId, total, items])

  return null
}
