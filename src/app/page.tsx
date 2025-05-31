"use client";

import React from "react";
// import { Heart, ShoppingCart } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gift, Package, ShieldCheck, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link"; // Importar Link

// Mock data for products (can be fetched from an API)
const mockProducts = [
  {
    id: "1",
    name: "Vestido Floral Bebé Niña",
    price: 35000,
    originalPrice: 45000,
    image: "/vestido-nina/tabata-morado-estampado-39698-726217_039698-2.webp",
    rating: 4.5,
    reviewCount: 23,
    sizes: ["3M", "6M", "9M", "12M"],
    colors: ["#F67280", "#F8B195", "#FFFFFF"],
    isNew: false,
    isOnSale: true,
    category: "Bebés",
  },
  {
    id: "2",
    name: "Conjunto Deportivo Niño",
    price: 42000,
    image: "/fujed-verde-16925-747727_016925-1.webp",
    rating: 4.8,
    reviewCount: 45,
    sizes: ["2T", "3T", "4T", "5T"],
    colors: ["#355C7D", "#6C5B7B", "#000000"],
    isNew: true,
    isOnSale: false,
    category: "Niños",
  },
  {
    id: "3",
    name: "Pijama Unicornio Niña",
    price: 28000,
    originalPrice: 35000,
    image: "/17343976750a17c6239ef2ac046bd8274802812ee4.webp",
    rating: 4.7,
    reviewCount: 67,
    sizes: ["2T", "3T", "4T", "5T", "6T"],
    colors: ["#F67280", "#6C5B7B", "#F8B195"],
    isNew: false,
    isOnSale: true,
    category: "Niñas",
  },
  {
    id: "4",
    name: "Body Básico Bebé Unisex",
    price: 18000,
    image: "/17211952012fd6203a0f7b39bb2242db32fbae2c39_thumbnail_900x.webp",
    rating: 4.9,
    reviewCount: 102,
    sizes: ["NB", "3M", "6M"],
    colors: ["#FFFFFF", "#E0E0E0", "#F8B195"],
    isNew: false,
    isOnSale: false,
    category: "Bebés",
  },
];

const featuredCategories = [
  {
    name: "Bebés (0-24m)",
    image: "/placeholder/bebes-0-24.png",
    href: "/category/babies",
  },
  { name: "Niñas", image: "/placeholder/ninas-1-6.png", href: "/category/girls" },
  { name: "Niños", image: "/placeholder/ninos-1-6.png", href: "/category/boys" },
  { name: "Accesorios", image: "/placeholder/accesorios.png", href: "/category/sales" },
];

// Ajustar colores de heroBanners para mejor contraste con la paleta "Modern Yellow"
const heroBanners = [
  {
    title: "Estilo Moderno para Pequeños", // Actualizado
    description: "Descubre la nueva colección con un toque dorado.", // Actualizado
    image: "/pexels-matilda-wormwood-7484842.jpg", // Actualizado
    buttonText: "Ver Colección", // Actualizado
    buttonLink: "/products/new-collection", // Ejemplo, podría ser genérico o específico
    bgColorClass: "bg-brand-silver/30",
    textColorClass: "text-brand-charcoal",
  },
  {
    title: "¡Ofertas Brillantes!", // Actualizado
    description: "Aprovecha descuentos especiales en prendas seleccionadas.", // Actualizado
    image: "/8683985.jpg",
    buttonText: "Ver Ofertas", // Actualizado
    buttonLink: "/category/sales", // Actualizado
    bgColorClass: "bg-brand-goldenYellow/20",
    textColorClass: "text-brand-charcoal",
  },
  {
    title: "Comodidad y Estilo", // Actualizado
    description: "Diseños neutros y modernos para el día a día.", // Actualizado
    image: "/pexels-pixabay-272056.jpg", // Actualizado
    buttonText: "Comprar Ahora", // Actualizado
    buttonLink: "/essentials", // Actualizado
    bgColorClass: "bg-brand-taupe/20",
    textColorClass: "text-brand-charcoal",
  },
];

export default function HomePage() {
  // Las funciones de carrito ahora se manejan a través del contexto `useCart`
  // y el componente AddToCartButton.
  // const handleAddToCart = (productId: string) => { ... }
  // const handleAddToWishlist = (productId: string) => { ... }
  // const handleQuickView = (productId: string) => { ... }

  const [currentBanner, setCurrentBanner] = React.useState(0);
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentBanner((prev) => (prev + 1) % heroBanners.length);
    }, 5000); // Cambia cada 5 segundos
    return () => clearTimeout(timer);
  }, [currentBanner]);

  return (
    // El div principal ya tiene bg-background y text-foreground del layout
    <div>
      {/* El header se maneja ahora desde RootLayout.tsx para evitar duplicación */}
      <main>
        {/* Hero Section */}
        <section className="relative h-[calc(100vh-80px)] min-h-[450px] md:min-h-[500px] lg:min-h-[600px] overflow-hidden">
          {heroBanners.map((banner, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentBanner ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover opacity-70"
                priority={true} // Aseguramos prioridad en todas las imágenes del banner para mejorar LCP
              />
              {/* Capa de color de fondo */}
              <div className={`absolute inset-0 ${banner.bgColorClass}`} />
              {/* Contenido del banner */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <h1
                  className={`font-montserrat font-bold text-3xl md:text-5xl lg:text-6xl ${banner.textColorClass} mb-4 animate-fade-in`}
                >
                  {banner.title}
                </h1>
                <p
                  className={`text-lg md:text-xl ${banner.textColorClass} max-w-2xl mb-8 animate-fade-in animation-delay-300`}
                >
                  {banner.description}
                </p>
                <Button
                  size="lg"
                  variant="default"
                  className="animate-fade-in animation-delay-600"
                >
                  <Link href={banner.buttonLink} className="flex items-center">
                    {banner.buttonText} <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
          {/* Indicadores de banner */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {heroBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-2.5 h-2.5 rounded-full ${
                  index === currentBanner
                    ? "bg-brand-goldenYellow"
                    : "bg-brand-taupe/60 hover:bg-brand-taupe"
                } transition-colors`}
                aria-label={`Ir al banner ${index + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Featured Categories Section */}
        <section className="py-12 md:py-20 bg-brand-offWhite">
          <div className="container mx-auto px-4">
            <h2 className="font-montserrat text-2xl md:text-3xl font-bold text-center text-foreground mb-10 md:mb-12">
              Explora Nuestras Categorías
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredCategories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 aspect-[0.615]"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      fill
                      priority={true}
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/70 via-brand-charcoal/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full">
                    <h3 className="font-montserrat text-lg md:text-xl font-semibold text-brand-offWhite group-hover:text-brand-goldenYellow transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-12 md:py-10 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="font-montserrat text-2xl md:text-3xl font-bold text-center text-foreground mb-10 md:mb-12">
              Nuestros Favoritos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {mockProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" >
                <Link href="/products" className="flex items-center">
                  {" "}
                  {/* Ruta genérica para todos los productos */}
                  Ver Todos los Productos{" "}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-20 bg-brand-silver/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[
                {
                  icon: Package,
                  title: "Envío Rápido",
                  desc: "A todo el país",
                },
                {
                  icon: Gift,
                  title: "Empaque Especial",
                  desc: "Listo para regalar",
                },
                {
                  icon: ShieldCheck,
                  title: "Pago Seguro",
                  desc: "Tus datos protegidos",
                },
                {
                  icon: Tag,
                  title: "Calidad Garantizada",
                  desc: "Prendas que duran",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col items-center p-6 bg-card rounded-xl shadow-md hover:shadow-lg transition-shadow"
                >
                  <item.icon className="w-10 h-10 text-brand-goldenYellow mb-4" />
                  <h3 className="font-montserrat font-semibold text-lg text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      {/* El footer se maneja ahora desde RootLayout.tsx */}
    </div>
  );
}
