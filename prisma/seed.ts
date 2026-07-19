import "dotenv/config";
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

  console.log("🧹 Wiping existing database transaction data...");
  
  await prisma.$transaction([
    // Messages & Conversations
    prisma.message.deleteMany(),
    prisma.conversation.deleteMany(),

    // Notifications & Search History
    prisma.notification.deleteMany(),
    prisma.notificationSettings.deleteMany(),
    prisma.searchHistory.deleteMany(),

    // Reviews
    prisma.reviewHelpful.deleteMany(),
    prisma.review.deleteMany(),

    // Community
    prisma.commentLike.deleteMany(),
    prisma.postComment.deleteMany(),
    prisma.postLike.deleteMany(),
    prisma.postTag.deleteMany(),
    prisma.postImage.deleteMany(),
    prisma.communityPost.deleteMany(),

    // Recipes
    prisma.recipeIngredient.deleteMany(),
    prisma.recipe.deleteMany(),

    // Preorders
    prisma.preorderReservation.deleteMany(),
    prisma.userCampaignSchedule.deleteMany(),
    prisma.preorderCampaign.deleteMany(),

    // Sourcing
    prisma.sourcingOffer.deleteMany(),
    prisma.sourcingRequest.deleteMany(),

    // Other Explore features
    prisma.liveStream.deleteMany(),
    prisma.groupBuy.deleteMany(),
    prisma.farmExperience.deleteMany(),

    // Orders & Delivery
    prisma.routeStop.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.deliveryRoute.deleteMany(),

    // Products
    prisma.productImage.deleteMany(),
    prisma.favorite.deleteMany(),
    prisma.productView.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),

    // Farmers
    prisma.farmerSpecialty.deleteMany(),
    prisma.farmer.deleteMany(),

    // Users & Addresses
    prisma.address.deleteMany(),
    prisma.userProfile.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.user.deleteMany(),
  ]);
  
  console.log("✅ Database wiped cleanly.");

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
  const farmerProfile1 = await prisma.farmer.upsert({
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

  const farmerProfile2 = await prisma.farmer.upsert({
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

  const farmerProfile3 = await prisma.farmer.upsert({
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
  const categoriesData = [
    {
      name: "Vegetables",
      slug: "vegetables",
      description: "Fresh vegetables from local farms",
      emoji: "🥦",
      gradientColors: ["#E8F5E9", "#A5D6A7"],
      displayOrder: 1,
    },
    {
      name: "Fruits",
      slug: "fruits",
      description: "Fresh seasonal fruits",
      emoji: "🍓",
      gradientColors: ["#FCE4EC", "#F48FB1"],
      displayOrder: 2,
    },
    {
      name: "Meat",
      slug: "meat",
      description: "Quality meat products",
      emoji: "🥩",
      gradientColors: ["#F3E5F5", "#CE93D8"],
      displayOrder: 3,
    },
    {
      name: "Fish",
      slug: "fish",
      description: "Fresh seafood",
      emoji: "🐟",
      gradientColors: ["#E3F2FD", "#90CAF9"],
      displayOrder: 4,
    },
    {
      name: "Dairy",
      slug: "dairy",
      description: "Dairy products",
      emoji: "🧀",
      gradientColors: ["#FFF9C4", "#FFF176"],
      displayOrder: 5,
    },
    {
      name: "Eggs",
      slug: "eggs",
      description: "Fresh eggs",
      emoji: "🥚",
      gradientColors: ["#FFFDE7", "#FFF59D"],
      displayOrder: 6,
    },
    {
      name: "Grains",
      slug: "grains",
      description: "Grains and cereals",
      emoji: "🌾",
      gradientColors: ["#F5F5DC", "#D7CCC8"],
      displayOrder: 7,
    },
  ];

  const categories: any[] = [];
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories.push(createdCat);
  }

  console.log("✅ Categories created");

  // Get category IDs
  const vegetablesCategory = categories[0];
  const fruitsCategory = categories[1];

  // Create products
  console.log("🥬 Creating products...");

  const productsWithImages = [
    // Vegetables
    {
      product: {
        name: "Fresh Lettuce",
        slug: "fresh-lettuce",
        description: "Crisp and fresh lettuce",
        categoryId: vegetablesCategory.id,
        sellerId: farmer1.id,
        price: 15000,
        currency: "IDR",
        unit: "head",
        stockQuantity: 50,
        isOrganic: true,
        isAvailable: true,
      },
      image:
        "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800&h=800&fit=crop",
    },
    {
      product: {
        name: "Organic Carrots",
        slug: "organic-carrots",
        description: "Sweet organic carrots",
        categoryId: vegetablesCategory.id,
        sellerId: farmer3.id,
        price: 35000,
        currency: "IDR",
        unit: "kg",
        stockQuantity: 100,
        isOrganic: true,
        isAvailable: true,
      },
      image:
        "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&h=800&fit=crop",
    },
    {
      product: {
        name: "Bell Peppers Mix",
        slug: "bell-peppers-mix",
        description: "Colorful bell peppers",
        categoryId: vegetablesCategory.id,
        sellerId: farmer2.id,
        price: 45000,
        currency: "IDR",
        unit: "pack",
        stockQuantity: 30,
        isOrganic: false,
        isAvailable: true,
      },
      image:
        "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&h=800&fit=crop",
    },
    {
      product: {
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
      },
      image:
        "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&h=800&fit=crop",
    },
    // Fruits
    {
      product: {
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
      },
      image:
        "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&h=800&fit=crop",
    },
    {
      product: {
        name: "Organic Apples",
        slug: "organic-apples",
        description: "Crisp organic apples",
        categoryId: fruitsCategory.id,
        sellerId: farmer1.id,
        price: 48000,
        currency: "IDR",
        unit: "kg",
        stockQuantity: 80,
        isOrganic: true,
        isAvailable: true,
      },
      image:
        "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&h=800&fit=crop",
    },
    {
      product: {
        name: "Bananas",
        slug: "bananas",
        description: "Fresh yellow bananas",
        categoryId: fruitsCategory.id,
        sellerId: farmer3.id,
        price: 25000,
        currency: "IDR",
        unit: "bunch",
        stockQuantity: 60,
        isOrganic: false,
        isAvailable: true,
      },
      image:
        "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=800&h=800&fit=crop",
    },
    {
      product: {
        name: "Fresh Spinach",
        slug: "fresh-spinach",
        description: "Nutritious fresh spinach leaves",
        categoryId: vegetablesCategory.id,
        sellerId: farmer1.id,
        price: 15000,
        currency: "IDR",
        unit: "bunch",
        stockQuantity: 35,
        isOrganic: true,
        isAvailable: true,
      },
      image:
        "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&h=800&fit=crop",
    },
    {
      product: {
        name: "Sweet Corn",
        slug: "sweet-corn",
        description: "Fresh sweet corn on the cob",
        categoryId: vegetablesCategory.id,
        sellerId: farmer2.id,
        price: 15000,
        currency: "IDR",
        unit: "piece",
        stockQuantity: 45,
        isOrganic: false,
        isAvailable: true,
      },
      image:
        "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&h=800&fit=crop",
    },
    {
      product: {
        name: "Cherry Tomatoes",
        slug: "cherry-tomatoes",
        description: "Sweet cherry tomatoes",
        categoryId: vegetablesCategory.id,
        sellerId: farmer3.id,
        price: 18000,
        currency: "IDR",
        unit: "pack",
        stockQuantity: 28,
        isOrganic: true,
        isAvailable: true,
      },
      image:
        "https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=800&h=800&fit=crop",
    },
    {
      product: {
        name: "Orange Juice Oranges",
        slug: "orange-juice-oranges",
        description: "Perfect for fresh juice",
        categoryId: fruitsCategory.id,
        sellerId: farmer1.id,
        price: 55000,
        currency: "IDR",
        unit: "kg",
        stockQuantity: 40,
        isOrganic: false,
        isAvailable: true,
      },
      image:
        "https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=800&h=800&fit=crop",
    },
    {
      product: {
        name: "Fresh Blueberries",
        slug: "fresh-blueberries",
        description: "Antioxidant-rich blueberries",
        categoryId: fruitsCategory.id,
        sellerId: farmer2.id,
        price: 95000,
        currency: "IDR",
        unit: "pack",
        stockQuantity: 15,
        isOrganic: true,
        isAvailable: true,
      },
      image:
        "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&h=800&fit=crop",
    },
    {
      product: {
        name: "Red Grapes",
        slug: "red-grapes",
        description: "Sweet seedless red grapes",
        categoryId: fruitsCategory.id,
        sellerId: farmer3.id,
        price: 65000,
        currency: "IDR",
        unit: "kg",
        stockQuantity: 25,
        isOrganic: false,
        isAvailable: true,
      },
      image:
        "https://images.unsplash.com/photo-1635843116188-b67a2f1ef23f?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cmVkJTIwZ3JhcGVzfGVufDB8fDB8fHww",
    },
  ];

  const createdProductsMap: Record<string, string> = {};
  for (const { product, image } of productsWithImages) {
    const createdProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
    createdProductsMap[product.slug] = createdProduct.id;

    // Add product image if it doesn't exist
    const existingImage = await prisma.productImage.findFirst({
      where: {
        productId: createdProduct.id,
        isPrimary: true,
      },
    });

    if (!existingImage) {
      await prisma.productImage.create({
        data: {
          productId: createdProduct.id,
          url: image,
          thumbnailUrl: image,
          altText: product.name,
          isPrimary: true,
          displayOrder: 0,
        },
      });
    }
  }

  console.log("✅ Products created");

  // Create consumer users for testing
  console.log("👥 Creating consumer users...");
  const consumerPassword = await bcrypt.hash("consumer123", 12);
  const consumer = await prisma.user.upsert({
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

  const consumer2 = await prisma.user.upsert({
    where: { email: "buyer2@harvest.com" },
    update: {},
    create: {
      email: "buyer2@harvest.com",
      password: consumerPassword,
      name: "Budi Santoso",
      userType: "CONSUMER",
      isVerified: true,
      phoneNumber: "+6281298765432",
    },
  });

  console.log("✅ Consumers created");

  // Ensure region master records exist for DKI Jakarta Central (to avoid foreign key errors for Addresses)
  let jakartaProvince = await prisma.province.findFirst({ where: { id: 31 } });
  if (!jakartaProvince) {
    jakartaProvince = await prisma.province.create({
      data: { id: 31, name: "DKI JAKARTA" }
    });
  }

  let jakartaCity = await prisma.city.findFirst({ where: { id: 3171 } });
  if (!jakartaCity) {
    jakartaCity = await prisma.city.create({
      data: { id: 3171, name: "KOTA JAKARTA PUSAT", provinceId: 31 }
    });
  }

  let tanahAbangDistrict = await prisma.district.findFirst({ where: { id: 3171010 } });
  if (!tanahAbangDistrict) {
    tanahAbangDistrict = await prisma.district.create({
      data: { id: 3171010, name: "TANAH ABANG", cityId: 3171 }
    });
  }

  console.log("📍 Creating dummy addresses...");
  const address1 = await prisma.address.create({
    data: {
      userId: consumer.id,
      label: "Home",
      recipientName: "Test Consumer",
      phone: "+6281234567899",
      fullAddress: "Jl. Sudirman No. 12, Kel. Karet Tengsin, Kec. Tanah Abang, Jakarta Pusat",
      postalCode: "10220",
      provinceId: 31,
      cityId: 3171,
      districtId: 3171010,
      latitude: -6.2198,
      longitude: 106.8183,
      isPrimary: true,
      isVerified: true,
    }
  });

  const address2 = await prisma.address.create({
    data: {
      userId: consumer2.id,
      label: "Apartment",
      recipientName: "Budi Santoso",
      phone: "+6281298765432",
      fullAddress: "Apartemen Thamrin Residence Tower A Lt. 15, Jl. Kebon Kacang Raya, Jakarta Pusat",
      postalCode: "10230",
      provinceId: 31,
      cityId: 3171,
      districtId: 3171010,
      latitude: -6.2155,
      longitude: 106.8152,
      isPrimary: true,
      isVerified: true,
    }
  });

  console.log("🌟 Creating Explore & Home feature data...");
  
  // 1. Farmer Specialties (Nearby Farmers)
  await prisma.farmerSpecialty.createMany({
    data: [
      { farmerId: farmerProfile1.id, specialty: "Organic Vegetables" },
      { farmerId: farmerProfile1.id, specialty: "Hydroponics" },
      { farmerId: farmerProfile2.id, specialty: "Fresh Fruits" },
      { farmerId: farmerProfile3.id, specialty: "Root Vegetables" },
    ],
    skipDuplicates: true,
  });

  // 2. Live Streams (Explore)
  await prisma.liveStream.createMany({
    data: [
      {
        farmerId: farmerProfile1.id,
        title: "Morning Harvest Walkthrough!",
        streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        viewers: 156,
        isLive: true,
      },
      {
        farmerId: farmerProfile2.id,
        title: "Fruit Picking & Q&A",
        streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        viewers: 89,
        isLive: true,
      },
    ],
  });

  // 3. Group Buys (Explore)
  const productForGroupBuy = await prisma.product.findFirst({
    where: { sellerId: farmer2.id },
  });
  if (productForGroupBuy) {
    await prisma.groupBuy.create({
      data: {
        farmerId: farmerProfile2.id,
        productId: productForGroupBuy.id,
        title: "Bulk Strawberry Purchase",
        price: 65000,
        originalPrice: 85000,
        targetCount: 50,
        joinedCount: 32,
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: "ACTIVE",
      },
    });
  }

  // 4. Preorder Campaigns & Reservations
  console.log("🥕 Creating preorder campaigns & reservations...");
  const preorderCampaign = await prisma.preorderCampaign.create({
    data: {
      farmerId: farmerProfile3.id,
      title: "Premium Grade A Carrots",
      description: "Preorder our upcoming harvest of premium carrots.",
      unit: "kg",
      pricePerUnit: 20000,
      targetQuantity: 100,
      currentBookedQuantity: 65,
      estimatedHarvestDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: "ACTIVE",
    },
  });

  await prisma.preorderReservation.create({
    data: {
      campaignId: preorderCampaign.id,
      userId: consumer.id,
      quantity: 35,
      totalPrice: 35 * 20000,
      status: "DEPOSIT_PAID",
      paymentMethod: "TRANSFER",
      deliveryMethod: "DELIVERY",
      addressId: address1.id,
    }
  });

  await prisma.preorderReservation.create({
    data: {
      campaignId: preorderCampaign.id,
      userId: consumer2.id,
      quantity: 30,
      totalPrice: 30 * 20000,
      status: "FULLY_PAID",
      paymentMethod: "COD",
      deliveryMethod: "DELIVERY",
      addressId: address2.id,
    }
  });

  // 5. Farm Experiences (Explore)
  await prisma.farmExperience.create({
    data: {
      farmerId: farmerProfile1.id,
      title: "Weekend Farm Tour & Tasting",
      description: "Join us for a lovely weekend tour.",
      location: "Green Valley Main Farm",
      eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      price: 150000,
      maxCapacity: 20,
      bookedCount: 12,
    },
  });

  // 6. Orders & Order Items (Home - Active Order & Staples)
  const consumerOrderProduct = await prisma.product.findFirst({
    where: { sellerId: farmer1.id },
  });
  if (consumerOrderProduct) {
    // Active order
    await prisma.order.create({
      data: {
        orderNumber: "ORD-TEST-001",
        buyerId: consumer.id,
        sellerId: farmer1.id,
        status: "processing",
        subtotal: consumerOrderProduct.price * 2,
        totalAmount: consumerOrderProduct.price * 2 + 10000,
        items: {
          create: {
            productId: consumerOrderProduct.id,
            productName: consumerOrderProduct.name,
            quantity: 2,
            unitPrice: consumerOrderProduct.price,
            subtotal: consumerOrderProduct.price * 2,
          },
        },
      },
    });
    // Past order to count as frequent staple
    await prisma.order.create({
      data: {
        orderNumber: "ORD-TEST-002",
        buyerId: consumer.id,
        sellerId: farmer1.id,
        status: "delivered",
        subtotal: consumerOrderProduct.price * 3,
        totalAmount: consumerOrderProduct.price * 3 + 10000,
        items: {
          create: {
            productId: consumerOrderProduct.id,
            productName: consumerOrderProduct.name,
            quantity: 3,
            unitPrice: consumerOrderProduct.price,
            subtotal: consumerOrderProduct.price * 3,
          },
        },
      },
    });
  }

  // 7. Community Posts (Home - Farmer Updates & Consumer Posts)
  console.log("📝 Creating community posts...");
  const post1 = await prisma.communityPost.create({
    data: {
      userId: farmer1.id,
      farmerId: farmerProfile1.id,
      title: "Harvest time!",
      content: "Just started harvesting our tomatoes. They look amazing this season!",
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&h=800&fit=crop",
            displayOrder: 0
          }
        ]
      },
      tags: {
        create: [
          { tag: "harvest" },
          { tag: "organic" },
          { tag: "tomatoes" }
        ]
      }
    }
  });

  const post2 = await prisma.communityPost.create({
    data: {
      userId: farmer2.id,
      farmerId: farmerProfile2.id,
      title: "New fruits coming soon",
      content: "We're preparing the fields for the next batch of strawberries.",
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&h=800&fit=crop",
            displayOrder: 0
          }
        ]
      },
      tags: {
        create: [
          { tag: "strawberries" },
          { tag: "fruits" },
          { tag: "fresh" }
        ]
      }
    }
  });

  const post3 = await prisma.communityPost.create({
    data: {
      userId: consumer.id,
      title: "Why buy local?",
      content: "Buying from local farmers not only supports our community but also means you get the freshest produce possible. Tastes so much better than supermarket food!",
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=800&fit=crop",
            displayOrder: 0
          }
        ]
      },
      tags: {
        create: [
          { tag: "healthy" },
          { tag: "local" },
          { tag: "community" }
        ]
      }
    }
  });

  // Create post comments & likes
  console.log("💬 Creating post comments & likes...");
  const comment1 = await prisma.postComment.create({
    data: {
      postId: post1.id,
      userId: consumer.id,
      content: "Those tomatoes look delicious! Can't wait for my order.",
      likesCount: 2
    }
  });

  const comment2 = await prisma.postComment.create({
    data: {
      postId: post1.id,
      userId: consumer2.id,
      content: "Do you have bulk wholesale discounts for restaurants?",
      likesCount: 1
    }
  });

  // Create comment likes
  await prisma.commentLike.create({
    data: {
      commentId: comment1.id,
      userId: farmer1.id
    }
  });

  await prisma.commentLike.create({
    data: {
      commentId: comment1.id,
      userId: consumer2.id
    }
  });

  await prisma.commentLike.create({
    data: {
      commentId: comment2.id,
      userId: farmer1.id
    }
  });

  // Create post likes
  await prisma.postLike.create({
    data: {
      postId: post1.id,
      userId: consumer.id
    }
  });

  await prisma.postLike.create({
    data: {
      postId: post1.id,
      userId: consumer2.id
    }
  });

  await prisma.postLike.create({
    data: {
      postId: post2.id,
      userId: consumer.id
    }
  });

  // 8. Recipes & Recipe Ingredients
  console.log("🍳 Creating recipes...");
  
  // Recipe 1: Tomato Basil Soup
  await prisma.recipe.create({
    data: {
      authorId: farmer1.id,
      title: "Tomato Basil Soup",
      description: "A warm, comforting soup made with fresh organic tomatoes from Green Valley Farm.",
      imageUrl: "https://images.unsplash.com/photo-1547592165-e1d17f8221f2?w=800&h=800&fit=crop",
      prepTimeMinutes: 15,
      cookTimeMinutes: 30,
      servings: 4,
      difficulty: "easy",
      isFeatured: true,
      instructions: [
        "Heat olive oil in a large pot.",
        "Sauté diced onions and garlic until translucent.",
        "Add fresh chopped organic tomatoes and vegetable broth.",
        "Simmer for 20 minutes.",
        "Blend until smooth, then stir in fresh basil leaves."
      ],
      ingredients: {
        create: [
          {
            name: "Fresh Organic Tomatoes",
            quantity: 1,
            unit: "kg",
            productId: createdProductsMap["organic-tomatoes"]
          },
          {
            name: "Basil leaves",
            quantity: 1,
            unit: "bunch"
          },
          {
            name: "Garlic cloves",
            quantity: 3,
            unit: "pieces"
          },
          {
            name: "Vegetable broth",
            quantity: 4,
            unit: "cups"
          }
        ]
      }
    }
  });

  // Recipe 2: Fresh Strawberry Shortcake
  await prisma.recipe.create({
    data: {
      authorId: farmer2.id,
      title: "Fresh Strawberry Shortcake",
      description: "Sweet and fluffy shortcake layered with fresh strawberries and whipped cream.",
      imageUrl: "https://images.unsplash.com/photo-1560180474-e8563fd75bab?w=800&h=800&fit=crop",
      prepTimeMinutes: 20,
      cookTimeMinutes: 15,
      servings: 6,
      difficulty: "medium",
      isFeatured: true,
      instructions: [
        "Preheat oven to 200°C.",
        "Mix flour, sugar, and baking powder.",
        "Cut in butter, then stir in milk to form a soft dough.",
        "Bake shortcakes for 15 minutes.",
        "Slice in half, layer with sliced strawberries and whipped cream."
      ],
      ingredients: {
        create: [
          {
            name: "Fresh Strawberries",
            quantity: 0.5,
            unit: "kg",
            productId: createdProductsMap["fresh-strawberries"]
          },
          {
            name: "Flour",
            quantity: 2,
            unit: "cups"
          },
          {
            name: "Whipped cream",
            quantity: 1,
            unit: "cup"
          }
        ]
      }
    }
  });

  // Recipe 3: Rosemary Baked Carrots
  await prisma.recipe.create({
    data: {
      authorId: farmer3.id,
      title: "Rosemary Baked Carrots",
      description: "Delicious oven-baked organic carrots seasoned with rosemary and olive oil.",
      imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&h=800&fit=crop",
      prepTimeMinutes: 10,
      cookTimeMinutes: 25,
      servings: 3,
      difficulty: "easy",
      isFeatured: false,
      instructions: [
        "Preheat oven to 200°C.",
        "Wash and peel the organic carrots, then slice them.",
        "Toss with olive oil, rosemary, salt, and pepper.",
        "Bake for 25 minutes until tender and golden brown."
      ],
      ingredients: {
        create: [
          {
            name: "Organic Carrots",
            quantity: 1,
            unit: "kg",
            productId: createdProductsMap["organic-carrots"]
          },
          {
            name: "Rosemary",
            quantity: 2,
            unit: "sprigs"
          },
          {
            name: "Olive oil",
            quantity: 2,
            unit: "tbsp"
          }
        ]
      }
    }
  });

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
