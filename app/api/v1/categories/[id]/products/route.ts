import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * @swagger
 * /api/v1/categories/{id}/products:
 *   get:
 *     summary: Get products in a specific category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [price, rating, newest]
 *     responses:
 *       200:
 *         description: List of products in category
 *       404:
 *         description: Category not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const sortBy = searchParams.get("sort_by") || "newest";

    // Find category by ID or slug
    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          status: "error",
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sortBy) {
      case "price":
        orderBy = { price: "asc" };
        break;
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    // Get products
    const [products, totalItems] = await Promise.all([
      prisma.product.findMany({
        where: {
          categoryId: category.id,
          isAvailable: true,
        },
        skip,
        take: limit,
        orderBy,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
            },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
            select: {
              url: true,
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
      prisma.product.count({
        where: {
          categoryId: category.id,
          isAvailable: true,
        },
      }),
    ]);

    const formattedProducts = products.map((product) => {
      const primaryImage = product.images[0];
      const activeDiscount = product.discounts[0];

      return {
        id: product.id,
        name: product.name,
        category_id: category.id,
        category_name: category.name,
        seller_id: product.sellerId,
        seller_name: product.seller.name,
        price: product.price,
        unit: product.unit,
        image_url: primaryImage?.url || null,
        rating: product.rating,
        review_count: product.reviewCount,
        is_organic: product.isOrganic,
        stock_quantity: product.stockQuantity,
        discount: activeDiscount
          ? `${activeDiscount.value}${
              activeDiscount.type === "percentage" ? "%" : ""
            } OFF`
          : null,
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
      },
    });
  } catch (error: any) {
    console.error("Error fetching category products:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch category products",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
