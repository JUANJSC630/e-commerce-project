"use client"

import * as React from "react"

type SlotProps = {
  children?: React.ReactNode
  asChild?: boolean
} & React.HTMLAttributes<HTMLElement>

/**
 * Este componente permite que los elementos pasen sus props a sus hijos
 */
const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, asChild = false, ...props }, ref) => {
    // Si no hay asChild o no hay children válidos, regresamos un span con los props
    if (!asChild || !React.isValidElement(children)) {
      return <span {...props} ref={ref as React.Ref<HTMLSpanElement>} />;
    }

    // Renderizamos directamente el elemento hijo con las propiedades combinadas
    // Ajustamos el tipo de `childProps` para incluir `ref`
    const childProps: React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> } = { ...props };

    if (ref) {
      childProps.ref = ref;
    }

    return React.isValidElement(children)
      ? React.cloneElement(children, childProps)
      : null;
  }
);

Slot.displayName = "Slot"

export { Slot }
