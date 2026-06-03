"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextType {
  selectedTab: string
  setSelectedTab: (value: string) => void
  tabsId: string
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined)

function useTabs() {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error("Tabs compound components must be used within a Tabs component")
  }
  return context
}

function generateUniqueId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`
}

interface TabsProps {
  className?: string
  children: React.ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

function Tabs({ className, children, value, defaultValue, onValueChange, ...props }: TabsProps) {
  const tabsId = React.useMemo(() => generateUniqueId("tabs"), [])
  const [selectedTabInternal, setSelectedTabInternal] = React.useState(defaultValue || "")

  const selectedTab = value !== undefined ? value : selectedTabInternal

  const setSelectedTab = React.useCallback(
    (value: string) => {
      if (onValueChange) {
        onValueChange(value)
      }
      if (value !== undefined) {
        setSelectedTabInternal(value)
      }
    },
    [onValueChange],
  )

  const tabTriggersRef = React.useRef<HTMLElement[]>([])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      const currentIndex = tabTriggersRef.current.findIndex(
        (trigger) => trigger === document.activeElement,
      )
      let nextIndex = currentIndex

      if (event.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % tabTriggersRef.current.length
      } else if (event.key === "ArrowLeft") {
        nextIndex =
          (currentIndex - 1 + tabTriggersRef.current.length) % tabTriggersRef.current.length
      }

      const nextTrigger = tabTriggersRef.current[nextIndex]
      if (nextTrigger) {
        nextTrigger.focus()
        const nextValue = nextTrigger.getAttribute("data-value")
        if (nextValue) {
          setSelectedTab(nextValue)
        }
      }
    }
  }

  // Set first tab as selected if none is selected
  React.useEffect(() => {
    if (selectedTab === "") {
      // Type-safe approach to finding the first tab value
      let foundTabValue: string | undefined

      React.Children.forEach(children, (child) => {
        if (foundTabValue) return

        if (hasDisplayName(child, "TabsList")) {
          const childProps = (child as React.ReactElement<{ children?: React.ReactNode }>).props
          React.Children.forEach(childProps.children, (nestedChild) => {
            if (foundTabValue) return

            if (
              hasDisplayName(nestedChild, "TabsTrigger") &&
              typeof (nestedChild as React.ReactElement<{ value?: unknown }>).props.value ===
                "string"
            ) {
              foundTabValue = (nestedChild as React.ReactElement<{ value: string }>).props.value
            }
          })
        }
      })

      if (foundTabValue) {
        setSelectedTab(foundTabValue)
      }
    }
  }, [children, selectedTab, setSelectedTab])

  return (
    <TabsContext.Provider value={{ selectedTab, setSelectedTab, tabsId }}>
      <div
        data-slot="tabs"
        className={cn("flex flex-col gap-2", className)}
        role="tablist"
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  className?: string
  children: React.ReactNode
}

function TabsList({ className, children, ...props }: TabsListProps) {
  const tabElements = React.useMemo(() => {
    return React.Children.map(children, (child) => {
      if (!hasDisplayName(child, "TabsTrigger")) {
        return null
      }
      return child
    })
  }, [children])

  return (
    <div className={cn("tabs-list", className)} {...props}>
      {tabElements}
    </div>
  )
}
TabsList.displayName = "TabsList"

interface TabsTriggerProps {
  className?: string
  children: React.ReactNode
  value: string
  disabled?: boolean
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, children, value, disabled = false, ...props }, ref) => {
    const { selectedTab, setSelectedTab, tabsId } = useTabs()

    return (
      <button
        ref={ref}
        className={cn("tabs-trigger", className)}
        role="tab"
        aria-selected={selectedTab === value}
        aria-controls={`${tabsId}-panel-${value}`}
        disabled={disabled}
        data-value={value}
        onClick={() => setSelectedTab(value)}
        {...props}
      >
        {children}
      </button>
    )
  },
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps {
  className?: string
  children: React.ReactNode
  value: string
  [key: string]: unknown
}

function TabsContent({ className, children, value, ...props }: TabsContentProps) {
  const { selectedTab, tabsId } = useTabs()
  const isSelected = selectedTab === value
  const tabId = `${tabsId}-tab-${value}`
  const panelId = `${tabsId}-panel-${value}`

  if (!isSelected) {
    return null
  }

  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      tabIndex={0}
      data-state={isSelected ? "active" : "inactive"}
      data-slot="tabs-content"
      className={cn("p-4 focus:outline-none", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function hasDisplayName(element: React.ReactNode, displayName: string): boolean {
  return (
    React.isValidElement(element) &&
    typeof element.type === "function" &&
    (element.type as React.FC).displayName === displayName
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
