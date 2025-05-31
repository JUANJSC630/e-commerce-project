"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: { className?: string; defaultValue?: number[]; value?: number[]; min?: number; max?: number }) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <div
      data-slot="slider"
      className={cn("relative flex w-full items-center", className)}
      {...props}
    >
      <div data-slot="slider-track" className="bg-gray-300 h-1 w-full rounded-full">
        <div data-slot="slider-range" className="bg-blue-500 h-1 rounded-full" />
      </div>
      {Array.from({ length: _values.length }, (_, index) => (
        <div
          data-slot="slider-thumb"
          key={index}
          className="bg-blue-500 w-4 h-4 rounded-full"
        />
      ))}
    </div>
  )
}

export { Slider }
