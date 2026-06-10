import { NextResponse } from "next/server"
import { getPaymentProvider, isOnsiteProvider } from "@/lib/payments"

/** PSE bank list changes rarely — cache it for an hour. */
export const revalidate = 3600

export async function GET() {
  const provider = getPaymentProvider()
  if (!isOnsiteProvider(provider)) {
    return NextResponse.json({ banks: [] }, { status: 404 })
  }

  try {
    const banks = await provider.getBanks()
    return NextResponse.json({ banks })
  } catch (err) {
    console.error("No se pudo cargar la lista de bancos PSE:", err)
    return NextResponse.json({ banks: [], error: "No disponible" }, { status: 502 })
  }
}
