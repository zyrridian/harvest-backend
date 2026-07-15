import { NextRequest, NextResponse } from "next/server";
import prisma from "@/core/database/prisma";
import { verifyAuth } from "@/features/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    const { id } = await params;

    // Find the farmer by id or userId
    let farmer = await prisma.farmer.findUnique({
      where: { id: id },
    });

    if (!farmer) {
      farmer = await prisma.farmer.findUnique({
        where: { userId: id },
      });
    }

    if (!farmer) {
      return NextResponse.json(
        {
          status: "error",
          message: "Farmer not found",
        },
        { status: 404 }
      );
    }

    if (farmer.userId === user.userId) {
      return NextResponse.json(
        {
          status: "error",
          message: "You cannot follow yourself",
        },
        { status: 400 }
      );
    }

    // Upsert or create FarmerFollower
    const follower = await prisma.farmerFollower.upsert({
      where: {
        farmerId_userId: {
          farmerId: farmer.id,
          userId: user.userId,
        },
      },
      update: {}, // Do nothing if it already exists
      create: {
        farmerId: farmer.id,
        userId: user.userId,
      },
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Successfully followed farmer",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error following farmer:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to follow farmer",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    const { id } = await params;

    // Find the farmer by id or userId
    let farmer = await prisma.farmer.findUnique({
      where: { id: id },
    });

    if (!farmer) {
      farmer = await prisma.farmer.findUnique({
        where: { userId: id },
      });
    }

    if (!farmer) {
      return NextResponse.json(
        {
          status: "error",
          message: "Farmer not found",
        },
        { status: 404 }
      );
    }

    // Delete FarmerFollower if it exists
    try {
      await prisma.farmerFollower.delete({
        where: {
          farmerId_userId: {
            farmerId: farmer.id,
            userId: user.userId,
          },
        },
      });
    } catch (e: any) {
      // Prisma throws an error if the record to delete doesn't exist.
      // We can safely ignore it because they're already unfollowed.
      if (e.code !== 'P2025') {
        throw e;
      }
    }

    return NextResponse.json({
      status: "success",
      message: "Successfully unfollowed farmer",
    });
  } catch (error: any) {
    console.error("Error unfollowing farmer:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to unfollow farmer",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
