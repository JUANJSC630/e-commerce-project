# Tabs Component

A fully accessible and keyboard navigable tabs component for React applications.

## Features

- Follows WAI-ARIA design pattern for [tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- Keyboard navigation with arrow keys, Home, and End
- Proper ARIA attributes for accessibility
- Supports both controlled and uncontrolled modes
- Styling with Tailwind CSS

## Usage

### Basic Example

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function TabsDemo() {
  return (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Cuenta</TabsTrigger>
        <TabsTrigger value="password">Contraseña</TabsTrigger>
        <TabsTrigger value="settings">Configuración</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        Contenido de la cuenta.
      </TabsContent>
      <TabsContent value="password">
        Cambie su contraseña aquí.
      </TabsContent>
      <TabsContent value="settings">
        Configuración de su cuenta.
      </TabsContent>
    </Tabs>
  );
}
```

### Controlled Mode

```tsx
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function ControlledTabsDemo() {
  const [activeTab, setActiveTab] = useState("account");
  
  return (
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab}
    >
      <TabsList>
        <TabsTrigger value="account">Cuenta</TabsTrigger>
        <TabsTrigger value="password">Contraseña</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        Contenido de la cuenta.
      </TabsContent>
      <TabsContent value="password">
        Cambie su contraseña aquí.
      </TabsContent>
    </Tabs>
  );
}
```

### Custom Styling

```tsx
<Tabs>
  <TabsList className="bg-muted p-1 rounded-lg">
    <TabsTrigger 
      value="tab1" 
      className="data-[state=active]:bg-background data-[state=active]:shadow rounded-md"
    >
      Tab 1
    </TabsTrigger>
    <TabsTrigger 
      value="tab2" 
      className="data-[state=active]:bg-background data-[state=active]:shadow rounded-md"
    >
      Tab 2
    </TabsTrigger>
  </TabsList>
  <TabsContent value="tab1" className="border rounded-lg p-6">
    Content for tab 1
  </TabsContent>
  <TabsContent value="tab2" className="border rounded-lg p-6">
    Content for tab 2
  </TabsContent>
</Tabs>
```

## API Reference

### Tabs

The main container component for the tabs.

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | The controlled value of the tab to activate |
| `defaultValue` | `string` | The default value of the tab to activate when initially rendered (uncontrolled) |
| `onValueChange` | `(value: string) => void` | Callback called when the active tab changes |
| `className` | `string` | Additional CSS classes |

### TabsList

The container component for tab triggers.

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | Additional CSS classes |

### TabsTrigger

The clickable element that activates its associated tab content.

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | A unique value for the tab |
| `disabled` | `boolean` | When `true`, prevents the user from interacting with the tab |
| `className` | `string` | Additional CSS classes |

### TabsContent

The content displayed when its associated tab trigger is active.

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | A unique value for the tab content, should match the value of the associated trigger |
| `className` | `string` | Additional CSS classes |

## Accessibility

This tabs implementation follows the [WAI-ARIA Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/):

- Each tab trigger has `role="tab"`
- The tab list has `role="tablist"`
- Each tab panel has `role="tabpanel"`
- Active tabs have `aria-selected="true"`
- Tab panels are associated with their trigger via `aria-controls` and `aria-labelledby`
- Keyboard navigation supports arrow keys, Home, and End
