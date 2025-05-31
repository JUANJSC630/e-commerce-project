"use client"

export function AspectRatio({
  children,
  ratio = 16 / 9,
  ...props
}: {
  children: React.ReactNode
  ratio?: number
} & React.ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{
        position: "relative",
        width: "100%",
        paddingTop: `${(1 / ratio) * 100}%`,
        ...props.style,
      }}
    >
      {children}
    </div>
  )
}
