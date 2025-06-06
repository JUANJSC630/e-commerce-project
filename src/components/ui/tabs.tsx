"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Need to declare the component types first to resolve the TypeScript errors
// with the React.Children usage
const TabsListComponent = () => <></>;

const TabsTriggerComponent = () => <></>;

// Forward references for type checking
const TabsListType = TabsListComponent as React.FC<{
  className?: string;
  children: React.ReactNode;
}>;

const TabsTriggerType = TabsTriggerComponent as React.FC<{
  className?: string;
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
}>;

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

function Tabs({
  className,
  children,
  value,
  defaultValue,
  onValueChange,
  ...props
}: TabsProps) {
  const tabsId = React.useMemo(() => generateUniqueId("tabs"), [])
  const [selectedTabInternal, setSelectedTabInternal] = React.useState(defaultValue || "")
  
  // Handle controlled or uncontrolled component
  const selectedTab = value !== undefined ? value : selectedTabInternal
  
  const setSelectedTab = React.useCallback((value: string) => {
    if (onValueChange) {
      onValueChange(value)
    }
    if (value !== undefined) {
      setSelectedTabInternal(value)
    }
  }, [onValueChange])
  
  // Set first tab as selected if none is selected
  React.useEffect(() => {
    if (selectedTab === "") {
      // Type-safe approach to finding the first tab value
      let foundTabValue: string | undefined;

      React.Children.forEach(children, (child) => {
        if (foundTabValue) return;
        
        if (React.isValidElement(child)) {
          // Check for TabsList component match
          if (child.type === TabsListType || child.type === TabsListComponent) {
            if (
              React.isValidElement(child) &&
              child.props &&
              (child.props as { children?: React.ReactNode }).children
            ) {
              const childProps = child.props as { children?: React.ReactNode };
              React.Children.forEach(childProps.children, (nestedChild) => {
                if (foundTabValue) return;
                
                if (React.isValidElement(nestedChild)) {
                  // Check for TabsTrigger component match
                  if (
                    (nestedChild.type === TabsTriggerType || nestedChild.type === TabsTriggerComponent) && 
                    typeof (nestedChild as React.ReactElement<{ value?: unknown }>).props.value === 'string'
                  ) {
                    foundTabValue = (nestedChild as React.ReactElement<{ value: string }>).props.value;
                  }
                }
              });
            }
          }
        }
      });

      if (foundTabValue) {
        setSelectedTab(foundTabValue);
      }
    }
  }, [children, selectedTab, setSelectedTab])

  return (
    <TabsContext.Provider value={{ selectedTab, setSelectedTab, tabsId }}>
      <div
        data-slot="tabs"
        className={cn("flex flex-col gap-2", className)}
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

function TabsList({
  className,
  children,
  ...props
}: TabsListProps) {
  const tabElements = React.useMemo(() => {
    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child) || child.type !== TabsTriggerType) {
        return child
      }
      return child
    })
  }, [children])

  return (
    <div
      role="tablist"
      data-slot="tabs-list"
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {tabElements}
    </div>
  )
}

interface TabsTriggerProps {
  className?: string
  children: React.ReactNode
  value: string
  disabled?: boolean
}

function TabsTrigger({
  className,
  children,
  value,
  disabled = false,
  ...props
}: TabsTriggerProps) {
  const { selectedTab, setSelectedTab, tabsId } = useTabs()
  const isSelected = selectedTab === value
  const tabId = `${tabsId}-tab-${value}`
  const panelId = `${tabsId}-panel-${value}`

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    // Find all tab triggers in the tab list
    const tabTriggers = Array.from(
      document.querySelectorAll(`[data-tabs-id="${tabsId}"][role="tab"]`)
    ) as HTMLElement[];
    
    const currentIndex = tabTriggers.findIndex(tab => tab.id === tabId);
    let nextIndex: number;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % tabTriggers.length;
        tabTriggers[nextIndex]?.focus();
        event.preventDefault();
        break;
      case "ArrowLeft":
        nextIndex = (currentIndex - 1 + tabTriggers.length) % tabTriggers.length;
        tabTriggers[nextIndex]?.focus();
        event.preventDefault();
        break;
      case "Home":
        tabTriggers[0]?.focus();
        event.preventDefault();
        break;
      case "End":
        tabTriggers[tabTriggers.length - 1]?.focus();
        event.preventDefault();
        break;
      default:
        break;
    }
  };

  return (
    <button
      id={tabId}
      role="tab"
      aria-selected={isSelected}
      aria-controls={panelId}
      tabIndex={isSelected ? 0 : -1}
      data-tabs-id={tabsId}
      data-state={isSelected ? "active" : "inactive"}
      data-slot="tabs-trigger"
      disabled={disabled}
      className={cn("px-4 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-goldenYellow disabled:opacity-50 disabled:cursor-not-allowed", 
        isSelected && "font-medium border-b-2 border-brand-goldenYellow",
        className)}
      onClick={() => !disabled && setSelectedTab(value)}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  className?: string
  children: React.ReactNode
  value: string
}

function TabsContent({
  className,
  children,
  value,
  ...props
}: TabsContentProps) {
  const { selectedTab, tabsId } = useTabs()
  const isSelected = selectedTab === value
  const tabId = `${tabsId}-tab-${value}`
  const panelId = `${tabsId}-panel-${value}`

  if (!isSelected) {
    return null;
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

export { Tabs, TabsList, TabsTrigger, TabsContent }
