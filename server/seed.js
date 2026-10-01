import { prisma } from "./lib/prisma.js";

const products = [
  {
    name: "Celeste Ring",
    slug: "celeste-ring",
    description:
      "A timeless gold-tone ring designed to bring a subtle touch of elegance to your everyday look.",
    category: "Rings",
    price: 3900,
    imageUrl:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=85",
    badge: "New",
    stock: 15,
    isActive: true,
  },
  {
    name: "Luna Necklace",
    slug: "luna-necklace",
    description:
      "A delicate necklace with a refined finish, perfect for layering or wearing on its own.",
    category: "Necklaces",
    price: 4500,
    imageUrl:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=85",
    badge: "New",
    stock: 12,
    isActive: true,
  },
  {
    name: "Éclat Earrings",
    slug: "eclat-earrings",
    description:
      "Elegant statement earrings that add a graceful sparkle to both everyday outfits and special occasions.",
    category: "Earrings",
    price: 3200,
    imageUrl:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=85",
    badge: "New",
    stock: 20,
    isActive: true,
  },
  {
    name: "Aurelia Bracelet",
    slug: "aurelia-bracelet",
    description:
      "A minimalist bracelet with a polished finish, created to complement your favorite jewelry pieces.",
    category: "Bracelets",
    price: 4100,
    imageUrl:
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=85",
    badge: "New",
    stock: 10,
    isActive: true,
  },
  {
    name: "Amour Set",
    slug: "amour-set",
    description:
      "A coordinated jewelry set designed to create an effortlessly elegant look.",
    category: "Sets",
    price: 6900,
    imageUrl:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=85",
    badge: "Bestseller",
    stock: 8,
    isActive: true,
  },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  console.log(`Successfully seeded ${products.length} LUNÉA products.`);
}

main()
  .catch((error) => {
    console.error("Product seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
