"use client"

import * as React from "react"

function Collapsible({
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
