import { Fragment } from "react"
import { ShoppingCart, Truck, CreditCard, PackageCheck, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckoutProgressProps {
  currentStep: number
  steps: string[]
}

/** One icon per checkout stage, in step order (Carrito → Envío → Pago → Confirmación). */
const STEP_ICONS = [ShoppingCart, Truck, CreditCard, PackageCheck]

export function CheckoutProgress({ currentStep, steps }: CheckoutProgressProps) {
  return (
    <nav className="w-full py-2" aria-label="Progreso del checkout">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isLast = index === steps.length - 1
          const Icon = STEP_ICONS[index] ?? ShoppingCart

          return (
            <Fragment key={step}>
              <li className="flex shrink-0 items-center gap-3">
                <span
                  className={cn(
                    "grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 transition-all duration-300",
                    isCompleted && "border-brand-base bg-brand-base text-brand-on-base",
                    isCurrent &&
                      "border-brand-base bg-brand-base/10 text-brand-base ring-4 ring-brand-base/15",
                    !isCompleted && !isCurrent && "border-border bg-muted/40 text-muted-foreground",
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`Paso ${stepNumber}: ${step} - ${
                    isCompleted ? "completado" : isCurrent ? "actual" : "pendiente"
                  }`}
                >
                  {isCompleted ? (
                    <Check
                      className="h-5 w-5 animate-in zoom-in-50 duration-300 motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                  ) : (
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  )}
                </span>
                <div className="hidden sm:block">
                  <p
                    className={cn(
                      "text-[11px] font-medium uppercase tracking-[0.12em]",
                      isCurrent ? "text-brand-base" : "text-muted-foreground",
                    )}
                  >
                    Paso {stepNumber}
                  </p>
                  <p
                    className={cn(
                      "text-sm font-semibold leading-tight",
                      isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {step}
                  </p>
                </div>
              </li>

              {!isLast && (
                <div
                  className="mx-2 h-1 flex-1 overflow-hidden rounded-full bg-border sm:mx-4"
                  role="presentation"
                  aria-hidden="true"
                >
                  <div
                    className={cn(
                      "h-full rounded-full bg-brand-base transition-all duration-500",
                      isCompleted ? "w-full" : "w-0",
                    )}
                  />
                </div>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
