import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pendiente", className: "bg-amber-100 text-amber-800" },
  CONFIRMED: { label: "Confirmado", className: "bg-blue-100 text-blue-800" },
  SHIPPED: { label: "Enviado", className: "bg-indigo-100 text-indigo-800" },
  DELIVERED: { label: "Entregado", className: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Cancelado", className: "bg-red-100 text-red-800" },
}

export function OrderStatusBadge({ status, className }: { status: string; className?: string }) {
  const s = STATUS[status] ?? { label: status, className: "bg-slate-100 text-slate-800" }
  return <Badge className={cn("border-transparent", s.className, className)}>{s.label}</Badge>
}
