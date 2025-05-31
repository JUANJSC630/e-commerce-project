"use client"

import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <label className={cn("flex items-center cursor-pointer", className)}>
      <input
        type="checkbox"
        className="sr-only"
        {...props}
      />
      <div className="flex items-center justify-center w-4 h-4 border rounded-[4px] border-input dark:bg-input/30 peer-checked:bg-primary peer-checked:text-primary-foreground dark:peer-checked:bg-primary peer-checked:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0">
        <CheckIcon className="size-3.5" />
      </div>
    </label>
  )
}

export { Checkbox }
