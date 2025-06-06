import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckoutProgressProps {
  currentStep: number
  steps: string[]
}

export function CheckoutProgress({ currentStep, steps }: CheckoutProgressProps) {
  return (
    <div className="w-full py-6">
      <div 
        className="flex items-center justify-between"
        role="navigation" 
        aria-label="Checkout progress"
      >
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep

          return (
            <div key={step} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200",
                    isCompleted && "bg-brand-goldenYellow border-brand-goldenYellow text-brand-charcoal",
                    isCurrent && "border-brand-goldenYellow text-brand-goldenYellow bg-brand-goldenYellow/10",
                    !isCompleted && !isCurrent && "border-border text-muted-foreground",
                  )}
                  role="status"
                  aria-label={`Step ${stepNumber}: ${step} - ${isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'}`}
                  tabIndex={0}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-labelledby={`step-label-${stepNumber}`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      (isCompleted || isCurrent) && "text-foreground",
                      !isCompleted && !isCurrent && "text-muted-foreground",
                    )}
                    id={`step-label-${stepNumber}`}
                  >
                    {step}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 transition-all duration-200",
                    isCompleted ? "bg-brand-goldenYellow" : "bg-border",
                  )}
                  role="presentation"
                  aria-hidden="true"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
