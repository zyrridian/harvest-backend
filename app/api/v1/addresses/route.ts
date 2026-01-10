import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken, extractBearerToken } from "@/lib/auth";

/**
 * @swagger
 * /api/v1/addresses:
 *   get:
 *     summary: Get user's saved addresses
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of addresses
 *       401:
 *         description: Unauthorized
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    const token = extractBearerToken(authHeader);
    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { status: "error", message: "Invalid token" },
        { status: 401 }
      );
    }
    const userId = payload.userId as string;

    // Get addresses
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
    });

    const formattedAddresses = addresses.map((addr) => ({
      address_id: addr.id,
      label: addr.label,
      recipient_name: addr.recipientName,
      phone: addr.phone,
      full_address: addr.fullAddress,
      province: addr.province,
      province_id: addr.provinceId,
      city: addr.city,
      city_id: addr.cityId,
      district: addr.district,
      district_id: addr.districtId,
      subdistrict: addr.subdistrict,
      postal_code: addr.postalCode,
      latitude: addr.latitude,
      longitude: addr.longitude,
      notes: addr.notes,
      is_primary: addr.isPrimary,
      is_verified: addr.isVerified,
      created_at: addr.createdAt,
      updated_at: addr.updatedAt,
    }));

    return NextResponse.json({
      status: "success",
      data: {
        addresses: formattedAddresses,
        total_count: addresses.length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch addresses",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/addresses:
 *   post:
 *     summary: Add new address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               recipient_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               full_address:
 *                 type: string
 *               province_id:
 *                 type: integer
 *               city_id:
 *                 type: integer
 *               district_id:
 *                 type: integer
 *               postal_code:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               notes:
 *                 type: string
 *               is_primary:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Address added successfully
 *       401:
 *         description: Unauthorized
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    const token = extractBearerToken(authHeader);
    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { status: "error", message: "Invalid token" },
        { status: 401 }
      );
    }
    const userId = payload.userId as string;

    const body = await request.json();
    const {
      label,
      recipient_name,
      phone,
      full_address,
      province_id,
      city_id,
      district_id,
      postal_code,
      latitude,
      longitude,
      notes,
      is_primary = false,
    } = body;

    // Validate required fields
    if (
      !label ||
      !recipient_name ||
      !phone ||
      !full_address ||
      !province_id ||
      !city_id ||
      !district_id ||
      !postal_code
    ) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields" },
        { status: 400 }
      );
    }

    // If setting as primary, unset other primary addresses
    if (is_primary) {
      await prisma.address.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Create address
    const address = await prisma.address.create({
      data: {
        userId,
        label,
        recipientName: recipient_name,
        phone,
        fullAddress: full_address,
        province: "Province", // TODO: Look up from database
        provinceId: province_id,
        city: "City", // TODO: Look up from database
        cityId: city_id,
        district: "District", // TODO: Look up from database
        districtId: district_id,
        subdistrict: null,
        postalCode: postal_code,
        latitude,
        longitude,
        notes,
        isPrimary: is_primary,
      },
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Address added successfully",
        data: {
          address_id: address.id,
          label: address.label,
          recipient_name: address.recipientName,
          phone: address.phone,
          full_address: address.fullAddress,
          province: address.province,
          province_id: address.provinceId,
          city: address.city,
          city_id: address.cityId,
          district: address.district,
          district_id: address.districtId,
          postal_code: address.postalCode,
          latitude: address.latitude,
          longitude: address.longitude,
          notes: address.notes,
          is_primary: address.isPrimary,
          is_verified: address.isVerified,
          created_at: address.createdAt,
          updated_at: address.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding address:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to add address",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
