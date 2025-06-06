// This component is adapted from the previous checkout implementation.
// It may require slight adjustments for the cart page.
// Ensure the colors align with the "Modern Yellow" palette.
// For example, the highlighted total should use the `text-brand-goldenYellow` class.
// The background can use `bg-brand-silver/30` or `bg-card` for consistency.
"use client"
import { Button } from "@/components/ui/button" // Ensure Button is imported
import Link from "next/link" // For the checkout button

// Define configuration constants for shipping
const SHIPPING_THRESHOLD = 150000 // Free shipping for orders above this amount
const SHIPPING_COST = 10000 // Shipping cost for orders below the threshold

interface CartItemSummary {
  id: string
  name: string
  price: number
  quantity: number
}

interface CartSummaryProps {
  items: CartItemSummary[]
  // Additional props for coupons, shipping, etc. can be added here
}

export function CartSummary({ items }: CartSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const total = subtotal + shipping

  return (
    <div className="bg-brand-silver/30 rounded-2xl p-6 text-brand-charcoal sticky top-28">
      <h3 className="font-montserrat font-semibold text-xl mb-6">Order Summary</h3>
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-brand-taupe">Subtotal</span>
          <span className="font-medium">${subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-brand-taupe">Estimated Shipping</span>
          <span className="font-medium">{shipping === 0 ? "Free" : `$${shipping.toLocaleString()}`}</span>
        </div>
        {/* Discount coupon field can be added here */}
        <div className="border-t border-brand-taupe/50 pt-3">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-brand-goldenYellow">${total.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <Button asChild size="lg" className="w-full">
        <Link href="/checkout-flow">Proceed to Payment</Link>
      </Button>
      <div className="mt-4 text-xs text-brand-taupe text-center">
        <p>
          Flexible return policy.{" "}
          <Link href="/politicas" className="underline hover:text-brand-goldenYellow">
            Read more
          </Link>
        </p>
      </div>
    </div>
  )
}
