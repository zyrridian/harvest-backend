import { NextRequest, NextResponse } from "next/server";
import prisma from "@/core/database/prisma";
import { verifyAuth } from "@/features/auth";
/**
 * @swagger
 * /api/v1/farmers/me/gallery:
 *   get:
 *     summary: Get farmer's own gallery
 *     tags: [Farmers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of gallery images
 *       403:
 *         description: Forbidden (Not a farmer)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);

    const farmer = await prisma.farmer.findUnique({
      where: { userId: user.userId },
    });

    if (!farmer) {
      return NextResponse.json(
        {
          status: "error",
          message: "Only farmers can view their own gallery this way",
        },
        { status: 403 }
      );
    }

    const gallery = await prisma.farmerGallery.findMany({
      where: { farmerId: farmer.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      status: "success",
      data: gallery.map((g) => ({
        id: g.id,
        image_url: g.imageUrl,
        caption: g.caption,
        created_at: g.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching farmer gallery:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch gallery",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/farmers/me/gallery:
 *   post:
 *     summary: Add an image to the farmer's gallery
 *     tags: [Farmers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - image_url
 *             properties:
 *               image_url:
 *                 type: string
 *               caption:
 *                 type: string
 *     responses:
 *       201:
 *         description: Gallery image added successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden (Not a farmer)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);

    // Verify user is a farmer
    const farmer = await prisma.farmer.findUnique({
      where: { userId: user.userId },
    });

    if (!farmer) {
      return NextResponse.json(
        {
          status: "error",
          message: "Only farmers can add to gallery",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { image_url, caption } = body;

    if (!image_url) {
      return NextResponse.json(
        {
          status: "error",
          message: "image_url is required",
        },
        { status: 400 }
      );
    }

    const galleryImage = await prisma.farmerGallery.create({
      data: {
        farmerId: farmer.id,
        imageUrl: image_url,
        caption: caption || null,
      },
    });

    return NextResponse.json(
      {
        status: "success",
        data: {
          id: galleryImage.id,
          image_url: galleryImage.imageUrl,
          caption: galleryImage.caption,
          created_at: galleryImage.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating farmer gallery image:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to add to gallery",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
