"use client"

import { useEffect, useRef, useState } from "react"
import ReactDOM from "react-dom"

function Dialog({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)

  const openDialog = () => setIsOpen(true)
  const closeDialog = () => setIsOpen(false)

  return (
    <div>
      <DialogTrigger onClick={openDialog} />
      {isOpen && (
        <DialogPortal>
          <DialogOverlay onClick={closeDialog} />
          <DialogContent onClose={closeDialog}>{children}</DialogContent>
        </DialogPortal>
      )}
    </div>
  )
}

function DialogContent({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement as HTMLElement
    contentRef.current?.focus()

    return () => {
      previouslyFocusedElement?.focus()
    }
  }, [])

  return ReactDOM.createPortal(
    <div
      ref={contentRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className="dialog-content"
    >
      {children}
      <button onClick={onClose} aria-label="Close dialog">
        Close
      </button>
    </div>,
    document.body
  )
}

function DialogTrigger({
  onClick,
}: {
  onClick: () => void
}) {
  return <button onClick={onClick}>Open Dialog</button>
}

function DialogPortal({
  children,
}: {
  children: React.ReactNode
}) {
  return ReactDOM.createPortal(children, document.body)
}

function DialogOverlay({
  onClick,
}: {
  onClick: () => void
}) {
  return <div className="dialog-overlay" onClick={onClick} />
}

export {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
}
