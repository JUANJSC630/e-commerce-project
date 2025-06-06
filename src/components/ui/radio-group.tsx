"use client"

import * as React from "react"
import { CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// Create a context to manage the radio group state
interface RadioGroupContextValue {
  value?: string
  onChange: (value: string) => void
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | undefined>(
  undefined
)

function RadioGroup({
  className,
  children,
  value,
  defaultValue,
  onChange,
  ...props
}: React.HTMLProps<HTMLDivElement> & {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
}) {
  // Use controlled or uncontrolled state based on provided props
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")
  
  const contextValue = React.useMemo(() => ({
    value: value !== undefined ? value : internalValue,
    onChange: (newValue: string) => {
      setInternalValue(newValue)
      onChange?.(newValue)
    },
  }), [value, internalValue, onChange])

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div
        data-slot="radio-group"
        role="radiogroup"
        className={cn("grid gap-3", className)}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

function RadioGroupItem({
  className,
  value,
  id,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { value: string; id?: string }) {
  const radioGroup = React.useContext(RadioGroupContext)
  
  if (!radioGroup) {
    throw new Error("RadioGroupItem must be used within a RadioGroup")
  }
  
  const isChecked = radioGroup.value === value
  
  // Split the className into logical groups for better readability
  const baseStyles = "aspect-square size-4 shrink-0 rounded-full border shadow-xs outline-none"
  const colorStyles = "border-input text-primary dark:bg-input/30"
  const stateStyles = "transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
  const validationStyles = "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
  const interactiveStyles = "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
  
  const handleClick = React.useCallback(() => {
    radioGroup.onChange(value)
  }, [radioGroup, value])
  
  return (
    <div
      data-slot="radio-group-item"
      data-state={isChecked ? "checked" : "unchecked"}
      role="radio"
      aria-checked={isChecked}
      id={id}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault()
          handleClick()
        }
      }}
      tabIndex={0}
      className={cn(
        baseStyles,
        colorStyles,
        stateStyles,
        validationStyles,
        interactiveStyles,
        isChecked && "border-primary", // Add a highlighted border when checked
        className
      )}
      {...props}
    >
      <div
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        {isChecked && (
          <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
        )}
      </div>
    </div>
  )
}

interface RadioGroupItemWithLabelProps {
  label: React.ReactNode
  value: string
  id?: string
  className?: string
}

function RadioGroupItemWithLabel({
  label,
  value,
  id,
  className,
  ...props
}: RadioGroupItemWithLabelProps & Omit<React.ComponentPropsWithoutRef<"div">, keyof RadioGroupItemWithLabelProps>) {
  const generatedId = React.useId()
  const radioId = id || `radio-${generatedId}`
  
  return (
    <div className="flex items-center space-x-2">
      <RadioGroupItem value={value} id={radioId} {...props} />
      <label 
        htmlFor={radioId}
        className={cn("text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70", 
        className)}
      >
        {label}
      </label>
    </div>
  )
}

export { RadioGroup, RadioGroupItem, RadioGroupItemWithLabel }
