import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Crear varias categorías
  const categoriesData = [
    { name: 'Bebés', description: 'Ropa y accesorios para bebés' },
    { name: 'Niñas', description: 'Moda y accesorios para niñas' },
    { name: 'Niños', description: 'Moda y accesorios para niños' },
    { name: 'Ofertas', description: 'Productos en promoción y descuento' },
    { name: 'Esenciales', description: 'Básicos y productos indispensables para niños y bebés' },
  ];

  await prisma.category.createMany({
    data: categoriesData,
    skipDuplicates: true,
  });

  // Recuperar las categorías creadas para obtener sus IDs
  const allCategories = await prisma.category.findMany();

  const getCategoryId = (name) => {
    const category = allCategories.find((c) => c.name === name);
    if (!category) throw new Error(`Category "${name}" not found`);
    return category.id;
  };

  // ==== Productos para Bebés ====
  const babyProducts = [
    {
      name: 'Body algodón manga larga',
      description: 'Body para bebé de algodón suave, ideal para piel sensible.',
      price: 39900,
      categoryId: getCategoryId('Bebés'),
      images: [
        { url: 'https://res.cloudinary.com/dulceinfancia/image/upload/v12345/body1.jpg', alt: 'Body algodón manga larga frontal', order: 1 },
        { url: 'https://res.cloudinary.com/dulceinfancia/image/upload/v12345/body2.jpg', alt: 'Body algodón manga larga detalle', order: 2 },
      ],
      variants: [
        { size: '3M', color: 'Blanco', stock: 10, price: 39900, sku: 'BODY-ALG-3M-BLA' },
        { size: '6M', color: 'Blanco', stock: 7, price: 39900, sku: 'BODY-ALG-6M-BLA' },
        { size: '9M', color: 'Blanco', stock: 3, price: 39900, sku: 'BODY-ALG-9M-BLA' },
      ],
    },
    {
      name: 'Babero impermeable',
      description: 'Babero con capa impermeable para proteger la ropa de tu bebé.',
      price: 15900,
      categoryId: getCategoryId('Bebés'),
      images: [
        { url: 'https://res.cloudinary.com/dulceinfancia/image/upload/v12345/babero1.jpg', alt: 'Babero impermeable azul', order: 1 },
      ],
      variants: [
        { size: 'Único', color: 'Azul', stock: 12, price: 15900, sku: 'BABERO-IMP-AZL' },
        { size: 'Único', color: 'Rosa', stock: 15, price: 15900, sku: 'BABERO-IMP-ROS' },
      ],
    },
    {
      name: 'Conjunto gorro y guantes',
      description: 'Set de gorro y guantes de algodón para bebé recién nacido.',
      price: 18900,
      categoryId: getCategoryId('Bebés'),
      images: [
        { url: 'https://res.cloudinary.com/dulceinfancia/image/upload/v12345/gorro1.jpg', alt: 'Gorro y guantes blanco', order: 1 },
      ],
      variants: [
        { size: 'RN', color: 'Blanco', stock: 8, price: 18900, sku: 'CONJ-GG-RN-BLA' },
      ],
    },
  ];

  // ==== Productos para Niñas ====
  const girlProducts = [
    {
      name: 'Vestido flores primavera',
      description: 'Vestido de algodón estampado con flores para niñas.',
      price: 49900,
      categoryId: getCategoryId('Niñas'),
      images: [
        { url: 'https://res.cloudinary.com/dulceinfancia/image/upload/v12345/vestido1.jpg', alt: 'Vestido flores primavera', order: 1 },
        { url: 'https://res.cloudinary.com/dulceinfancia/image/upload/v12345/vestido2.jpg', alt: 'Detalle manga vestido', order: 2 },
      ],
      variants: [
        { size: '2A', color: 'Rosa', stock: 6, price: 49900, sku: 'VEST-FLR-2A-ROS' },
        { size: '4A', color: 'Rosa', stock: 4, price: 49900, sku: 'VEST-FLR-4A-ROS' },
      ],
    },
    {
      name: 'Leggins algodón niña',
      description: 'Leggins cómodos y elásticos para niñas.',
      price: 29900,
      categoryId: getCategoryId('Niñas'),
      images: [
        { url: 'https://res.cloudinary.com/dulceinfancia/image/upload/v12345/leggins1.jpg', alt: 'Leggins rosas', order: 1 },
      ],
      variants: [
        { size: '6A', color: 'Rosa', stock: 10, price: 29900, sku: 'LEGGINS-ALG-6A-ROS' },
        { size: '8A', color: 'Negro', stock: 7, price: 29900, sku: 'LEGGINS-ALG-8A-NEG' },
      ],
    },
  ];

  // ==== Productos para Niños ====
  const boyProducts = [
    {
      name: 'Camiseta básica niño',
      description: 'Camiseta de algodón básica, ideal para todos los días.',
      price: 19900,
      categoryId: getCategoryId('Niños'),
      images: [
        { url: 'https://res.cloudinary.com/dulceinfancia/image/upload/v12345/camiseta1.jpg', alt: 'Camiseta básica azul', order: 1 },
      ],
      variants: [
        { size: '4A', color: 'Azul', stock: 9, price: 19900, sku: 'CAMI-BAS-4A-AZU' },
        { size: '6A', color: 'Verde', stock: 6, price: 19900, sku: 'CAMI-BAS-6A-VER' },
      ],
    },
    {
      name: 'Short deportivo niño',
      description: 'Short ligero y cómodo para actividades deportivas.',
      price: 24900,
      categoryId: getCategoryId('Niños'),
      images: [
        { url: 'https://res.cloudinary.com/dulceinfancia/image/upload/v12345/short1.jpg', alt: 'Short deportivo gris', order: 1 },
      ],
      variants: [
        { size: '6A', color: 'Gris', stock: 5, price: 24900, sku: 'SHORT-DEP-6A-GRI' },
        { size: '8A', color: 'Rojo', stock: 7, price: 24900, sku: 'SHORT-DEP-8A-ROJ' },
      ],
    },
  ];

  // ==== Productos para Ofertas ====
  const saleProducts = [
    {
      name: 'Pijama polar niño oferta',
      description: 'Pijama calentita en oferta edición limitada.',
      price: 19900,
      categoryId: getCategoryId('Ofertas'),
      images: [
        { url: 'https://res.cloudinary.com/dulceinfancia/image/upload/v12345/pijama1.jpg', alt: 'Pijama polar niño vista frontal', order: 1 },
      ],
      variants: [
        { size: '8A', color: 'Azul', stock: 5, price: 19900, sku: 'PIJAMA-POL-8A-AZU' },
      ],
    },
    {
      name: 'Zapatos deportivos oferta',
      description: 'Zapatos deportivos para niño en liquidación.',
      price: 29900,
      categoryId: getCategoryId('Ofertas'),
      images: [
        { url: 'https://res.cloudinary.com/dulceinfancia/image/upload/v12345/zapato1.jpg', alt: 'Zapato deportivo azul', order: 1 },
      ],
      variants: [
        { size: '28', color: 'Azul', stock: 2, price: 29900, sku: 'ZAPA-DEP-28-AZU' },
        { size: '30', color: 'Negro', stock: 1, price: 29900, sku: 'ZAPA-DEP-30-NEG' },
      ],
    },
  ];

  // ==== Productos Esenciales ====
  const essentialProducts = [
    {
      name: 'Pañal ecológico reutilizable',
      description: 'Pañal ecológico reutilizable, ajustable para varias edades.',
      price: 25900,
      categoryId: getCategoryId('Esenciales'),
      images: [
        { url: 'https://res.cloudinary.com/dulceinfancia/image/upload/v12345/panal1.jpg', alt: 'Pañal ecológico', order: 1 },
      ],
      variants: [
        { size: 'Único', color: 'Verde', stock: 20, price: 25900, sku: 'PANAL-ECO-VER' },
      ],
    },
    {
      name: 'Set de baberos básicos',
      description: 'Pack de 3 baberos en colores surtidos.',
      price: 16900,
      categoryId: getCategoryId('Esenciales'),
      images: [
        { url: 'https://res.cloudinary.com/dulceinfancia/image/upload/v12345/baberoSet1.jpg', alt: 'Set baberos básicos', order: 1 },
      ],
      variants: [
        { size: 'Único', color: 'Surtido', stock: 10, price: 16900, sku: 'SET-BABEROS' },
      ],
    },
  ];

  // Agrupar todos los productos
  const allProducts = [
    ...babyProducts,
    ...girlProducts,
    ...boyProducts,
    ...saleProducts,
    ...essentialProducts,
  ];

  // Insertar productos y sus imágenes/variantes
  for (const product of allProducts) {
    const createdProduct = await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId,
      }
    });

    // Imágenes
    await prisma.productImage.createMany({
      data: product.images.map(img => ({
        ...img,
        productId: createdProduct.id,
      })),
    });

    // Variantes
    await prisma.productVariant.createMany({
      data: product.variants.map(variant => ({
        ...variant,
        productId: createdProduct.id,
      })),
    });
  }
}

main()
  .then(() => {
    console.log('¡Muchos productos de prueba insertados correctamente!');
    return prisma.$disconnect();
  })
  .catch(e => {
    console.error(e);
    return prisma.$disconnect();
  });
