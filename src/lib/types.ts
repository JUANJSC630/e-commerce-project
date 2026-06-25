/** A single gallery photo as the storefront consumes it. */
export interface ProductImageDto {
  url: string
  alt?: string
}

/** A purchasable size×color combination as the storefront consumes it. */
export interface ProductVariantDto {
  id: string
  size?: string
  color?: string
  sku?: string
  /** Effective unit price (already resolved: variant price or the product price). */
  price: number
  stock: number
  /** Variant-specific image; falls back to the product cover when absent. */
  imageUrl?: string
}

export interface Product {
  id: string
  name: string
  price: number
  image: string
  /** Alt text for the image (a11y/SEO). Falls back to the product name when empty. */
  imageAlt?: string
  /** Additional gallery photos (ordered). The detail page shows the cover first, then these. */
  images?: ProductImageDto[]
  /** Purchasable size×color variants. When present, selectors/stock/price come from these. */
  variants?: ProductVariantDto[]
  originalPrice?: number
  rating?: number
  reviewCount?: number
  sizes?: string[]
  colors?: string[] // Colores disponibles del producto
  tags?: string[]
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
  /** The chosen variant, when the product has variants. Drives stock + price server-side. */
  variantId?: string
}

export interface CartContextType {
  items: CartItem[]
  addItem: (
    product: Product,
    quantity: number,
    selectedSize?: string,
    selectedColor?: string,
    variantId?: string,
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
