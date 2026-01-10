import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Get all product categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      emoji: category.emoji,
      gradient_colors: category.gradientColors,
      product_count: category._count.products,
      display_order: category.displayOrder,
      is_active: category.isActive,
    }));

    return NextResponse.json({
      status: "success",
      data: formattedCategories,
    });
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch categories",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
