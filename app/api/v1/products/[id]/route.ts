import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get detailed information about a specific product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
        // Await params in Next.js 15+
    const { id } = await params;

const product = await prisma.product.findUnique({
      where: { id: id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        subcategory: {
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
            userType: true,
            isOnline: true,
          },
        },
        images: {
          orderBy: { displayOrder: "asc" },
        },
        videos: true,
        specifications: {
          orderBy: { displayOrder: "asc" },
        },
        tags: true,
        certifications: true,
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
    });

    if (!product) {
      return NextResponse.json(
        {
          status: "error",
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    // Get seller profile information
    const sellerProfile = await prisma.userProfile.findUnique({
      where: { userId: product.sellerId },
    });

    // Get farmer information if seller is a producer
    const farmerInfo = await prisma.farmer.findUnique({
      where: { userId: product.sellerId },
    });

    const activeDiscount = product.discounts[0];

    const response = {
      status: "success",
      data: {
        product_id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        long_description: product.longDescription,
        category: product.category
          ? {
              category_id: product.category.id,
              name: product.category.name,
              slug: product.category.slug,
            }
          : null,
        subcategory: product.subcategory
          ? {
              subcategory_id: product.subcategory.id,
              name: product.subcategory.name,
              slug: product.subcategory.slug,
            }
          : null,
        price: product.price,
        currency: product.currency,
        unit: product.unit,
        discount: activeDiscount
          ? {
              discount_id: activeDiscount.id,
              type: activeDiscount.type,
              value: activeDiscount.value,
              discounted_price: activeDiscount.discountedPrice,
              savings:
                activeDiscount.type === "percentage"
                  ? product.price * (activeDiscount.value / 100)
                  : activeDiscount.value,
              valid_from: activeDiscount.validFrom,
              valid_until: activeDiscount.validUntil,
              reason: activeDiscount.reason,
            }
          : null,
        stock_quantity: product.stockQuantity,
        minimum_order: product.minimumOrder,
        maximum_order: product.maximumOrder,
        unit_weight: product.unitWeight,
        images: product.images.map((img) => ({
          image_id: img.id,
          url: img.url,
          thumbnail_url: img.thumbnailUrl,
          medium_url: img.mediumUrl,
          alt_text: img.altText,
          is_primary: img.isPrimary,
          order: img.displayOrder,
        })),
        videos: product.videos.map((vid) => ({
          video_id: vid.id,
          url: vid.url,
          thumbnail_url: vid.thumbnailUrl,
          duration: vid.duration,
          title: vid.title,
        })),
        seller: {
          seller_id: product.seller.id,
          user_id: product.seller.id,
          name: product.seller.name,
          avatar_url: product.seller.avatarUrl,
          profile_picture: product.seller.avatarUrl,
          rating: farmerInfo?.rating || 0,
          reviews_count: farmerInfo?.totalReviews || 0,
          verified: farmerInfo?.isVerified || false,
          verification_badge: farmerInfo?.verificationBadge,
          location: farmerInfo
            ? {
                city: farmerInfo.city,
                state: farmerInfo.state,
                latitude: farmerInfo.latitude,
                longitude: farmerInfo.longitude,
              }
            : null,
          response_rate: sellerProfile?.responseRate || 0,
          response_time: sellerProfile?.responseTime,
          total_products: farmerInfo?.totalProducts || 0,
          joined_since: sellerProfile?.joinedSince,
          joined_date: farmerInfo?.joinedDate,
          followers_count: farmerInfo?.followersCount || 0,
        },
        farmer: farmerInfo ? {
          name: farmerInfo.name,
          farm_name: farmerInfo.name,
          city: farmerInfo.city,
          is_verified: farmerInfo.isVerified,
          rating: farmerInfo.rating,
          total_products: farmerInfo.totalProducts,
        } : null,
        specifications: product.specifications.map((spec) => ({
          key: spec.specKey,
          value: spec.specValue,
        })),
        certifications: product.certifications.map((cert) => ({
          certification_id: cert.id,
          name: cert.name,
          issuer: cert.issuer,
          certificate_number: cert.certificateNumber,
          issue_date: cert.issueDate,
          expiry_date: cert.expiryDate,
          verified: cert.verified,
          badge_url: cert.badgeUrl,
        })),
        rating: {
          average: product.rating,
          count: product.reviewCount,
          distribution: {
            "5_star": 0, // TODO: Implement when reviews are added
            "4_star": 0,
            "3_star": 0,
            "2_star": 0,
            "1_star": 0,
          },
        },
        attributes: {
          is_organic: product.isOrganic,
          is_local: false, // TODO: Add to schema if needed
          is_seasonal: false, // TODO: Add to schema if needed
          harvest_date: product.harvestDate,
          expiry_date: null, // TODO: Add to schema if needed
          origin: null, // TODO: Add to schema if needed
          storage_instructions: null, // TODO: Add to schema if needed
          nutritional_info: null, // TODO: Add to schema if needed
        },
        is_organic: product.isOrganic,
        is_available: product.isAvailable,
        harvest_date: product.harvestDate,
        tags: product.tags.map((t) => t.tag),
        view_count: product.viewCount,
        created_at: product.createdAt,
        updated_at: product.updatedAt,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch product",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
