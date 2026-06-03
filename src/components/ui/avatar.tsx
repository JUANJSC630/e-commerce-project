"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"

function Avatar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar"
      className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  alt = "Avatar image",
  src,
  ...props
}: { src: string } & Omit<React.ComponentProps<typeof Image>, "src">) {
  return (
    <Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      alt={alt}
      src={src}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-fallback"
      className={cn("bg-muted flex size-full items-center justify-center rounded-full", className)}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
