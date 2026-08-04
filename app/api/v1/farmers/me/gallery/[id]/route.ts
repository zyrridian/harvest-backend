import { NextRequest, NextResponse } from "next/server";
import prisma from "@/core/database/prisma";
import { verifyAuth } from "@/features/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    
    // Await params in Next.js 15+
    const { id: galleryId } = await params;

    // Verify user is a farmer
    const farmer = await prisma.farmer.findUnique({
      where: { userId: user.userId },
    });

    if (!farmer) {
      return NextResponse.json(
        {
          status: "error",
          message: "Only farmers can manage gallery",
        },
        { status: 403 }
      );
    }

    const galleryImage = await prisma.farmerGallery.findUnique({
      where: { id: galleryId },
    });

    if (!galleryImage) {
      return NextResponse.json(
        {
          status: "error",
          message: "Gallery image not found",
        },
        { status: 404 }
      );
    }

    if (galleryImage.farmerId !== farmer.id) {
      return NextResponse.json(
        {
          status: "error",
          message: "You don't have permission to delete this image",
        },
        { status: 403 }
      );
    }

    await prisma.farmerGallery.delete({
      where: { id: galleryId },
    });

    return NextResponse.json({
      status: "success",
      message: "Gallery image deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting farmer gallery image:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to delete gallery image",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
