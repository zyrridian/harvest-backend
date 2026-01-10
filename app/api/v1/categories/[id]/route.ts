import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Get category details
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
      include: {
        _count: {
          select: { products: true },
        },
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

    return NextResponse.json({
      status: "success",
      data: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        emoji: category.emoji,
        gradient_colors: category.gradientColors,
        product_count: category._count.products,
        display_order: category.displayOrder,
        is_active: category.isActive,
      },
    });
  } catch (error: any) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch category",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
