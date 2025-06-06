"use client";
import React from "react";

import type { Product } from "@/lib/types";
// import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Simulación de un producto fijo para mostrar en la página de detalle
const demoProduct: Product = {
  id: "demo-001",
  name: "Vestido Floral Bebé Niña",
  price: 35000,
  originalPrice: 45000,
  image: "/vestido-nina/tabata-morado-estampado-39698-726217_039698-2.webp",
  images: [
    "/vestido-nina/tabata-morado-estampado-39698-726217_039698-2.webp",
    "/vestido-nina/tabata-morado-estampado-39698-726217_039698-3.webp",
    "/vestido-nina/tabata-morado-estampado-39698-726217_039698-4.webp",
    "/vestido-nina/tabata-morado-estampado-39698-726217_039698-5_2238c422-2935-48bb-a413-eb7ef88b83d4.webp",
    "/vestido-nina/tabata-morado-estampado-39698-726217_039698-6.webp"
  ],
  rating: 4.8,
  reviewCount: 112,
  sizes: ["2T", "3T", "4T", "5T"],
  colors: ["#F2CF1D", "#FBF2ED", "#CDD5C6"],
  isNew: true,
  isOnSale: true,
  category: "Niñas",
  description: "Vestido de verano ligero y fresco con un hermoso estampado floral. Ideal para días soleados y ocasiones especiales."
};

export default function ProductDetailPage() {
  const product = demoProduct;
  const [mainImage, setMainImage] = useState(product.image);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
      {/* Galería de imágenes */}
      <section>
        <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-contain"
            priority
          />
        </div>
        {/* Si hay más imágenes, mostrar miniaturas */}
        {product.images && product.images.length > 1 && (
          <div className="flex gap-2 mt-4">
            {product.images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setMainImage(img)}
                className={`w-16 h-16 relative rounded overflow-hidden border transition-all ${mainImage === img ? "ring-2 ring-primary border-primary" : "border"}`}
                aria-label={`Ver imagen ${i + 1}`}
              >
                <Image src={img} alt={product.name} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Detalles del producto */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          {product.isNew && <Badge variant="outline">Nuevo</Badge>}
          {product.isOnSale && <Badge variant="destructive">Oferta</Badge>}
        </div>
        <h1 className="text-2xl font-bold leading-tight">{product.name}</h1>
        <div className="flex items-center gap-4">
          <span className="text-xl font-semibold text-primary">${product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="line-through text-muted-foreground">${product.originalPrice.toLocaleString()}</span>
          )}
        </div>
        {product.rating && (
          <div className="flex items-center gap-2 text-sm text-yellow-500">
            <span>★ {product.rating}</span>
            {product.reviewCount && <span className="text-muted-foreground">({product.reviewCount} reseñas)</span>}
          </div>
        )}
        {product.description && <p className="text-muted-foreground">{product.description}</p>}
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Tallas:</span>
            <div className="flex gap-1 flex-wrap">
              {product.sizes.map((size) => (
                <span key={size} className="px-2 py-1 border rounded text-xs">{size}</span>
              ))}
            </div>
          </div>
        )}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Colores:</span>
            <div className="flex gap-1">
              {product.colors.map((color, i) => (
                <span
                  key={i}
                  className="w-5 h-5 rounded-full border border-border inline-block"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
        <AddToCartButton product={product} className="w-full mt-4 font-medium" />
        <Link href="/products" className="text-sm text-primary underline mt-2">← Volver a productos</Link>
      </section>
    </main>
  );
}
