"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Context for sharing state between select components
interface SelectContextValue {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  label?: string
  activeIndex: number
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>
  items: SelectItemType[]
  registerItem: (item: SelectItemType) => void
  unregisterItem: (value: string) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
}

interface SelectItemType {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

interface SelectProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  name?: string
  required?: boolean
  children: React.ReactNode
  label?: string
}

function Select({
  defaultValue,
  value: controlledValue,
  onValueChange,
  disabled,
  name,
  required,
  children,
  label,
}: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [items, setItems] = React.useState<SelectItemType[]>([])
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  
  // Handle controlled or uncontrolled component
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue
  
  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
      setOpen(false)
      triggerRef.current?.focus()
    },
    [isControlled, onValueChange]
  )
  
  // Handle item registration for keyboard navigation
  const registerItem = React.useCallback(
    (item: SelectItemType) => {
      setItems((prevItems) => [...prevItems, item])
    },
    []
  )
  
  const unregisterItem = React.useCallback(
    (itemValue: string) => {
      setItems((prevItems) => prevItems.filter((item) => item.value !== itemValue))
    },
    []
  )
  
  // Handle click outside to close dropdown
  React.useEffect(() => {
    if (!open) return
    
    function handleClickOutside(event: MouseEvent) {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])
  
  // Hidden native select for form submission
  const nativeSelectId = React.useId()
  
  return (
    <SelectContext.Provider
      value={{
        open,
        setOpen,
        value,
        onValueChange: handleValueChange,
        disabled,
        label,
        activeIndex,
        setActiveIndex,
        items,
        registerItem,
        unregisterItem,
        triggerRef,
        contentRef
      }}
    >
      <div data-slot="select" className="relative">
        {children}
        {name && (
          <select
            id={nativeSelectId}
            name={name}
            value={value}
            onChange={(e) => handleValueChange(e.target.value)}
            required={required}
            disabled={disabled}
            aria-hidden
            tabIndex={-1}
            className="sr-only"
          >
            {items.map((item) => (
              <option key={item.value} value={item.value} disabled={item.disabled}>
                {typeof item.label === "string" ? item.label : ""}
              </option>
            ))}
          </select>
        )}
      </div>
    </SelectContext.Provider>
  )
}

interface SelectGroupProps {
  label?: string
  children: React.ReactNode
  className?: string
}

function SelectGroup({
  label,
  children,
  className,
  ...props
}: SelectGroupProps & Omit<React.HTMLAttributes<HTMLDivElement>, "children">) {
  return (
    <div 
      data-slot="select-group" 
      role="group"
      aria-label={label}
      className={cn("px-1 py-1.5", className)} 
      {...props}
    >
      {label && <div className="px-2 text-xs font-medium text-muted-foreground mb-1">{label}</div>}
      {children}
    </div>
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: {
  className?: string;
  size?: "sm" | "default";
  children: React.ReactNode;
}) {
  const { open, setOpen } = React.useContext(SelectContext) ?? {};

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!setOpen) return;

    switch (event.key) {
      case "ArrowDown":
      case "Enter":
        setOpen(true);
        break;
      case "Escape":
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <button
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input flex items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm",
        className
      )}
      aria-haspopup="listbox"
      aria-expanded={open}
      onKeyDown={handleKeyDown}
      onClick={() => setOpen?.(!open)}
      {...props}
    >
      {children}
    </button>
  );
}

function SelectContent({
  className,
  children,
  ...props
}: { className?: string; children: React.ReactNode }) {
  return (
    <div data-slot="select-content" className={cn("bg-white shadow-md rounded-md", className)} {...props}>
      {children}
    </div>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
}
