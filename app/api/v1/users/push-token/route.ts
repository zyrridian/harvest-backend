import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/features/auth";
import prisma from "@/core/database/prisma";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ status: "fail", message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token);
    
    if (!payload || payload.type !== "access") {
      return NextResponse.json({ status: "fail", message: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { socketId } = body;

    if (!socketId) {
      return NextResponse.json(
        { status: "fail", message: "socketId is required" },
        { status: 400 }
      );
    }

    // Save pushSocketId to user
    await prisma.user.update({
      where: { id: payload.userId },
      data: { pushSocketId: socketId },
    });

    return NextResponse.json({
      status: "success",
      message: "Push socket registered successfully",
    });
  } catch (error: any) {
    console.error("Error registering push token:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to register push token" },
      { status: 500 }
    );
  }
}
