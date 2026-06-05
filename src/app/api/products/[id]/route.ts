import { NextResponse } from "next/server"
import { getProductById } from "@/lib/products"

type Params = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params
    const product = await getProductById(id)
    if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: "No se pudo cargar el producto" }, { status: 500 })
  }
}
