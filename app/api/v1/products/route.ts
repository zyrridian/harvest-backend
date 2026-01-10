import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get list of products with filters and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: seller_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: is_organic
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [price, rating, newest, popular]
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: List of products
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Filters
    const category = searchParams.get("category");
    const sellerId = searchParams.get("seller_id");
    const isOrganic = searchParams.get("is_organic");
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");
    const sortBy = searchParams.get("sort_by") || "newest";
    const order = searchParams.get("order") || "desc";

    // Build where clause
    const where: any = {
      isAvailable: true,
    };

    if (category) {
      where.OR = [{ categoryId: category }, { category: { slug: category } }];
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (isOrganic !== null && isOrganic !== undefined) {
      where.isOrganic = isOrganic === "true";
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sortBy) {
      case "price":
        orderBy = { price: order };
        break;
      case "rating":
        orderBy = { rating: order };
        break;
      case "popular":
        orderBy = { viewCount: order };
        break;
      case "newest":
      default:
        orderBy = { createdAt: order };
        break;
    }

    // Get products with relations
    const [products, totalItems] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
            select: {
              url: true,
              thumbnailUrl: true,
            },
          },
          tags: {
            select: {
              tag: true,
            },
          },
          discounts: {
            where: {
              isActive: true,
              validFrom: { lte: new Date() },
              validUntil: { gte: new Date() },
            },
            take: 1,
            orderBy: { value: "desc" },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Format response
    const formattedProducts = products.map((product) => {
      const primaryImage = product.images[0];
      const activeDiscount = product.discounts[0];

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category?.name || null,
        price: product.price,
        unit: product.unit,
        image_url: primaryImage?.url || null,
        images: product.images.map((img) => img.url),
        is_organic: product.isOrganic,
        is_available: product.isAvailable,
        stock: product.stockQuantity,
        discount: activeDiscount
          ? activeDiscount.type === "percentage"
            ? activeDiscount.value
            : null
          : null,
        rating: product.rating,
        review_count: product.reviewCount,
        farmer_id: product.sellerId,
        farmer_name: product.seller.name,
        harvest_date: product.harvestDate,
        tags: product.tags.map((t) => t.tag),
        created_at: product.createdAt,
      };
    });

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      status: "success",
      data: formattedProducts,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_items: totalItems,
        items_per_page: limit,
        has_next: page < totalPages,
        has_previous: page > 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch products",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
