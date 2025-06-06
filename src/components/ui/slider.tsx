"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'value'> {
  className?: string
  defaultValue?: number[]
  value?: number[]
  min?: number
  max?: number
  onValueChange?: (value: number[]) => void
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  onValueChange,
  ...props
}: SliderProps) {
  const [values, setValues] = React.useState<number[]>(
    Array.isArray(value)
      ? value
      : Array.isArray(defaultValue)
        ? defaultValue
        : [min, max]
  )

  // Update internal state when controlled value changes
  React.useEffect(() => {
    if (Array.isArray(value)) {
      setValues(value)
    }
  }, [value])

  // Handler for value changes - Wrapped in useCallback
  const handleValueChange = React.useCallback((newValues: number[]) => {
    setValues(newValues)
    onValueChange?.(newValues)
  }, [onValueChange])

  const sliderRef = React.useRef<HTMLDivElement>(null)
  
  // Wrapped in useCallback
  const getValueFromPosition = React.useCallback((position: number): number => {
    if (!sliderRef.current) return min
    
    const rect = sliderRef.current.getBoundingClientRect()
    const percentage = Math.max(0, Math.min(1, (position - rect.left) / rect.width))
    return min + percentage * (max - min)
  }, [min, max])
  
  const handleDrag = React.useCallback((event: MouseEvent | TouchEvent, thumbIndex: number) => {
    const clientX = 'touches' in event 
      ? event.touches[0].clientX 
      : event.clientX
      
    const newValue = getValueFromPosition(clientX)
    const newValues = [...values]
    
    // Ensure values stay in order and within bounds
    newValues[thumbIndex] = Math.max(
      thumbIndex > 0 ? newValues[thumbIndex - 1] : min,
      Math.min(
        thumbIndex < newValues.length - 1 ? newValues[thumbIndex + 1] : max,
        newValue
      )
    )
    
    handleValueChange(newValues)
  }, [min, max, values, handleValueChange, getValueFromPosition])
  
  const handleThumbMouseDown = (event: React.MouseEvent, thumbIndex: number) => {
    event.preventDefault()
    
    const handleMouseMove = (e: MouseEvent) => {
      handleDrag(e, thumbIndex)
    }
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
  
  const handleThumbTouchStart = (event: React.TouchEvent, thumbIndex: number) => {
    event.preventDefault()
    
    const handleTouchMove = (e: TouchEvent) => {
      handleDrag(e, thumbIndex)
    }
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
    
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
  }
  
  const handleTrackClick = (event: React.MouseEvent) => {
    if (!sliderRef.current) return
    
    const value = getValueFromPosition(event.clientX)
    const distances = values.map(v => Math.abs(v - value))
    const closestThumbIndex = distances.indexOf(Math.min(...distances))
    
    const newValues = [...values]
    newValues[closestThumbIndex] = value
    handleValueChange(newValues)
  }
  
  const handleKeyDown = (event: React.KeyboardEvent, thumbIndex: number) => {
    const step = (max - min) / 100 // 1% of the range as default step
    const newValues = [...values]
    
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        newValues[thumbIndex] = Math.max(
          min, 
          thumbIndex > 0 ? Math.max(values[thumbIndex - 1], values[thumbIndex] - step) : values[thumbIndex] - step
        )
        event.preventDefault()
        break
        
      case 'ArrowRight':
      case 'ArrowUp':
        newValues[thumbIndex] = Math.min(
          max,
          thumbIndex < values.length - 1 ? Math.min(values[thumbIndex + 1], values[thumbIndex] + step) : values[thumbIndex] + step
        )
        event.preventDefault()
        break
        
      case 'Home':
        newValues[thumbIndex] = thumbIndex > 0 ? values[thumbIndex - 1] : min
        event.preventDefault()
        break
        
      case 'End':
        newValues[thumbIndex] = thumbIndex < values.length - 1 ? values[thumbIndex + 1] : max
        event.preventDefault()
        break
        
      default:
        return
    }
    
    handleValueChange(newValues)
  }

  return (
    <div
      ref={sliderRef}
      data-slot="slider"
      className={cn("relative flex w-full items-center h-10 touch-none", className)}
      onClick={handleTrackClick}
      {...props}
    >
      <div 
        data-slot="slider-track" 
        className="bg-gray-300 h-1 w-full rounded-full absolute"
      >
        <div 
          data-slot="slider-range" 
          className="bg-blue-500 h-1 rounded-full absolute" 
          style={{
            left: `${Math.min(...values.map(v => ((v - min) / (max - min)) * 100))}%`,
            width: `${Math.abs(values.reduce((a, v) => Math.max(a, ((v - min) / (max - min)) * 100), 0) - 
              values.reduce((a, v) => Math.min(a, ((v - min) / (max - min)) * 100), 100))}%`
          }}
        />
      </div>
      
      {values.map((value, index) => {
        const percent = ((value - min) / (max - min)) * 100
        
        return (
          <div
            data-slot="slider-thumb"
            role="slider"
            tabIndex={0}
            key={index}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-label={`Thumb ${index + 1} of ${values.length}`}
            className="bg-blue-500 w-5 h-5 rounded-full absolute -translate-x-1/2 top-1/2 -translate-y-1/2 cursor-grab focus:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            style={{ left: `${percent}%` }}
            onMouseDown={(e) => handleThumbMouseDown(e, index)}
            onTouchStart={(e) => handleThumbTouchStart(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
        )
      })}
    </div>
  )
}

export { Slider }
