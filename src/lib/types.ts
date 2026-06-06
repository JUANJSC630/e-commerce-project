export interface Product {
  id: string
  name: string
  price: number
  image: string
  originalPrice?: number
  rating?: number
  reviewCount?: number
  sizes?: string[]
  colors?: string[] // Colores disponibles del producto
  /** Category the product belongs to (from the admin-managed Category table). */
  category?: { name: string; slug: string } | null
  description?: string
  isOnSale?: boolean
  isNew?: boolean
  /** Units available. `undefined` means stock is not tracked for this product. */
  stock?: number
}

export interface CartItem extends Product {
  quantity: number
  selectedSize?: string
  selectedColor?: string // Color seleccionado por el usuario
}

export interface CartContextType {
  items: CartItem[]
  addItem: (
    product: Product,
    quantity: number,
    selectedSize?: string,
    selectedColor?: string,
  ) => void
  removeItem: (productId: string, selectedSize?: string, selectedColor?: string) => void
  updateItemQuantity: (
    productId: string,
    quantity: number,
    selectedSize?: string,
    selectedColor?: string,
  ) => void
  clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
  getTotal: () => number // Podría incluir envío, descuentos, etc. en el futuro
  isCartOpen: boolean
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
}
