import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // Create admin user
  console.log("👤 Creating admin user...");
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@harvest.com" },
    update: {},
    create: {
      email: "admin@harvest.com",
      password: adminPassword,
      name: "Admin User",
      userType: "ADMIN",
      isVerified: true,
    },
  });
  console.log("✅ Admin created:", admin.email);

  // Create producer users (farmers)
  console.log("👨‍🌾 Creating farmers...");
  const farmerPassword = await bcrypt.hash("farmer123", 12);

  const farmer1 = await prisma.user.upsert({
    where: { email: "greenvalley@harvest.com" },
    update: {},
    create: {
      email: "greenvalley@harvest.com",
      password: farmerPassword,
      name: "Green Valley Farm",
      userType: "PRODUCER",
      isVerified: true,
      phoneNumber: "+6281234567890",
    },
  });

  const farmer2 = await prisma.user.upsert({
    where: { email: "sunrise@harvest.com" },
    update: {},
    create: {
      email: "sunrise@harvest.com",
      password: farmerPassword,
      name: "Sunrise Organic",
      userType: "PRODUCER",
      isVerified: true,
      phoneNumber: "+6281234567891",
    },
  });

  const farmer3 = await prisma.user.upsert({
    where: { email: "freshfields@harvest.com" },
    update: {},
    create: {
      email: "freshfields@harvest.com",
      password: farmerPassword,
      name: "Fresh Fields Co.",
      userType: "PRODUCER",
      isVerified: true,
      phoneNumber: "+6281234567892",
    },
  });

  // Create farmer profiles
  console.log("🏡 Creating farmer profiles...");
  await prisma.farmer.upsert({
    where: { userId: farmer1.id },
    update: {},
    create: {
      userId: farmer1.id,
      name: "Green Valley Farm",
      description: "Organic vegetables from our family farm",
      latitude: -6.2088,
      longitude: 106.8456,
      address: "Jl. Raya No. 123",
      city: "Jakarta",
      isVerified: true,
      hasMapFeature: true,
      rating: 4.8,
    },
  });

  await prisma.farmer.upsert({
    where: { userId: farmer2.id },
    update: {},
    create: {
      userId: farmer2.id,
      name: "Sunrise Organic",
      description: "Fresh fruits and vegetables",
      latitude: -6.2,
      longitude: 106.85,
      address: "Jl. Pertanian No. 45",
      city: "Jakarta",
      isVerified: true,
      hasMapFeature: true,
      rating: 4.6,
    },
  });

  await prisma.farmer.upsert({
    where: { userId: farmer3.id },
    update: {},
    create: {
      userId: farmer3.id,
      name: "Fresh Fields Co.",
      description: "Quality produce since 1990",
      latitude: -6.215,
      longitude: 106.84,
      address: "Jl. Hijau No. 78",
      city: "Jakarta",
      isVerified: true,
      hasMapFeature: true,
      rating: 4.9,
    },
  });

  console.log("✅ Farmers created");

  // Create categories
  console.log("📂 Creating categories...");
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "vegetables" },
      update: {},
      create: {
        name: "Vegetables",
        slug: "vegetables",
        description: "Fresh vegetables from local farms",
        emoji: "🥦",
        gradientColors: ["#E8F5E9", "#A5D6A7"],
        displayOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "fruits" },
      update: {},
      create: {
        name: "Fruits",
        slug: "fruits",
        description: "Fresh seasonal fruits",
        emoji: "🍓",
        gradientColors: ["#FCE4EC", "#F48FB1"],
        displayOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: "meat" },
      update: {},
      create: {
        name: "Meat",
        slug: "meat",
        description: "Quality meat products",
        emoji: "🥩",
        gradientColors: ["#F3E5F5", "#CE93D8"],
        displayOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: "fish" },
      update: {},
      create: {
        name: "Fish",
        slug: "fish",
        description: "Fresh seafood",
        emoji: "🐟",
        gradientColors: ["#E3F2FD", "#90CAF9"],
        displayOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: "dairy" },
      update: {},
      create: {
        name: "Dairy",
        slug: "dairy",
        description: "Dairy products",
        emoji: "🧀",
        gradientColors: ["#FFF9C4", "#FFF176"],
        displayOrder: 5,
      },
    }),
    prisma.category.upsert({
      where: { slug: "eggs" },
      update: {},
      create: {
        name: "Eggs",
        slug: "eggs",
        description: "Fresh eggs",
        emoji: "🥚",
        gradientColors: ["#FFFDE7", "#FFF59D"],
        displayOrder: 6,
      },
    }),
    prisma.category.upsert({
      where: { slug: "grains" },
      update: {},
      create: {
        name: "Grains",
        slug: "grains",
        description: "Grains and cereals",
        emoji: "🌾",
        gradientColors: ["#F5F5DC", "#D7CCC8"],
        displayOrder: 7,
      },
    }),
  ]);

  console.log("✅ Categories created");

  // Get category IDs
  const vegetablesCategory = categories[0];
  const fruitsCategory = categories[1];

  // Create products
  console.log("🥬 Creating products...");

  const products = [
    // Vegetables
    {
      name: "Fresh Lettuce",
      slug: "fresh-lettuce",
      description: "Crisp and fresh lettuce",
      categoryId: vegetablesCategory.id,
      sellerId: farmer1.id,
      price: 2.49,
      currency: "USD",
      unit: "head",
      stockQuantity: 50,
      isOrganic: true,
      isAvailable: true,
    },
    {
      name: "Organic Carrots",
      slug: "organic-carrots",
      description: "Sweet organic carrots",
      categoryId: vegetablesCategory.id,
      sellerId: farmer3.id,
      price: 3.99,
      currency: "USD",
      unit: "kg",
      stockQuantity: 100,
      isOrganic: true,
      isAvailable: true,
    },
    {
      name: "Bell Peppers Mix",
      slug: "bell-peppers-mix",
      description: "Colorful bell peppers",
      categoryId: vegetablesCategory.id,
      sellerId: farmer2.id,
      price: 5.49,
      currency: "USD",
      unit: "pack",
      stockQuantity: 30,
      isOrganic: false,
      isAvailable: true,
    },
    {
      name: "Organic Tomatoes",
      slug: "organic-tomatoes",
      description: "Vine-ripened tomatoes",
      categoryId: vegetablesCategory.id,
      sellerId: farmer1.id,
      price: 25000,
      currency: "IDR",
      unit: "kg",
      stockQuantity: 22,
      isOrganic: true,
      isAvailable: true,
      harvestDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
    },
    // Fruits
    {
      name: "Fresh Strawberries",
      slug: "fresh-strawberries",
      description: "Sweet strawberries",
      categoryId: fruitsCategory.id,
      sellerId: farmer2.id,
      price: 85000,
      currency: "IDR",
      unit: "kg",
      stockQuantity: 12,
      isOrganic: true,
      isAvailable: true,
      harvestDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days
    },
    {
      name: "Organic Apples",
      slug: "organic-apples",
      description: "Crisp organic apples",
      categoryId: fruitsCategory.id,
      sellerId: farmer1.id,
      price: 4.99,
      currency: "USD",
      unit: "kg",
      stockQuantity: 80,
      isOrganic: true,
      isAvailable: true,
    },
    {
      name: "Bananas",
      slug: "bananas",
      description: "Fresh yellow bananas",
      categoryId: fruitsCategory.id,
      sellerId: farmer3.id,
      price: 2.99,
      currency: "USD",
      unit: "bunch",
      stockQuantity: 60,
      isOrganic: false,
      isAvailable: true,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  console.log("✅ Products created");

  // Create a consumer user for testing
  console.log("👥 Creating consumer user...");
  const consumerPassword = await bcrypt.hash("consumer123", 12);
  await prisma.user.upsert({
    where: { email: "consumer@harvest.com" },
    update: {},
    create: {
      email: "consumer@harvest.com",
      password: consumerPassword,
      name: "Test Consumer",
      userType: "CONSUMER",
      isVerified: true,
      phoneNumber: "+6281234567899",
    },
  });

  console.log("✅ Consumer created");

  console.log("\n✨ Seed completed successfully!");
  console.log("\n📝 Test Accounts:");
  console.log("Admin: admin@harvest.com / admin123");
  console.log("Farmer 1: greenvalley@harvest.com / farmer123");
  console.log("Farmer 2: sunrise@harvest.com / farmer123");
  console.log("Farmer 3: freshfields@harvest.com / farmer123");
  console.log("Consumer: consumer@harvest.com / consumer123");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
