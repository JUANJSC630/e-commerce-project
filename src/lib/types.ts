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
  category?: string
  description?: string
  isOnSale?: boolean
  isNew?: boolean
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
