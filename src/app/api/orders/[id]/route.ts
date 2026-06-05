import { NextResponse } from "next/server"
import { getOrderForConfirmation } from "@/lib/orders"

type Params = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params
    const order = await getOrderForConfirmation(id)
    if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ error: "No se pudo cargar el pedido" }, { status: 500 })
  }
}
