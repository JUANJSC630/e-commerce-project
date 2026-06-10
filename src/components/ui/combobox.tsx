"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onChange: (value: string) => void
  /**
   * When provided, internal filtering is disabled and this is called (raw, per
   * keystroke — debounce upstream) so the parent can supply server-filtered
   * options. Use for large/remote datasets like cities.
   */
  onSearchChange?: (query: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  loading?: boolean
  disabled?: boolean
  id?: string
  className?: string
  /** Extra classes for the trigger button (e.g. height overrides). */
  triggerClassName?: string
  "aria-invalid"?: boolean
}

/**
 * Searchable single-select built on cmdk. Self-contained dropdown (no external
 * popover dependency): a styled trigger toggles an absolutely-positioned panel,
 * closed on outside-click or Escape. Filters locally unless `onSearchChange` is
 * given, in which case the parent owns filtering (async datasets).
 */
export function Combobox({
  options,
  value,
  onChange,
  onSearchChange,
  placeholder = "Selecciona…",
  searchPlaceholder = "Buscar…",
  emptyText = "Sin resultados.",
  loading = false,
  disabled = false,
  id,
  className,
  triggerClassName,
  "aria-invalid": ariaInvalid,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)
  const listboxId = React.useId()

  // Fall back to the raw value as its own label so an async-filtered selection
  // (e.g. a chosen city that's no longer in the current results) still shows.
  const selected =
    options.find((o) => o.value === value) ?? (value ? { value, label: value } : undefined)

  const close = React.useCallback(() => {
    setOpen(false)
    setQuery("")
    // Keep async consumers (e.g. city search) in sync with the cleared input.
    onSearchChange?.("")
  }, [onSearchChange])

  // Close (and reset search) on outside pointer or Escape.
  React.useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, close])

  const handleQuery = (q: string) => {
    setQuery(q)
    onSearchChange?.(q)
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-invalid={ariaInvalid}
        disabled={disabled}
        onClick={() => (open ? close() : setOpen(true))}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
          triggerClassName,
        )}
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          <Command shouldFilter={!onSearchChange}>
            <CommandInput
              value={query}
              onValueChange={handleQuery}
              placeholder={searchPlaceholder}
            />
            <CommandList id={listboxId}>
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Cargando…
                </div>
              ) : (
                <>
                  <CommandEmpty>{emptyText}</CommandEmpty>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => {
                        onChange(option.value)
                        close()
                      }}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          option.value === value ? "opacity-100 text-brand-base" : "opacity-0",
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{option.label}</span>
                    </CommandItem>
                  ))}
                </>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}
