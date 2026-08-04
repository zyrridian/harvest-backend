import { NextRequest, NextResponse } from "next/server";
import prisma from "@/core/database/prisma";
import { verifyAuth } from "@/features/auth";

/**
 * @swagger
 * /api/v1/farmers/{id}:
 *   get:
 *     summary: Get detailed farmer profile
 *     tags: [Farmers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Farmer profile details
 *       404:
 *         description: Farmer not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Await params in Next.js 15+
    const { id } = await params;

    const includeOptions = {
      specialties: {
        select: {
          specialty: true,
        },
      },
      dropPoints: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" as const },
      },
      user: {
        select: {
          id: true,
          isOnline: true,
          profile: {
            select: {
              responseRate: true,
              responseTime: true,
            },
          },
        },
      },
    };

    // Try to find by farmer.id first, then by userId
    let farmer = await prisma.farmer.findUnique({
      where: { id: id },
      include: includeOptions,
    });

    // If not found by farmer.id, try finding by userId
    if (!farmer) {
      farmer = await prisma.farmer.findUnique({
        where: { userId: id },
        include: includeOptions,
      });
    }

    if (!farmer) {
      return NextResponse.json(
        {
          status: "error",
          message: "Farmer not found",
        },
        { status: 404 },
      );
    }

    let currentUserId: string | undefined;
    try {
      const user = await verifyAuth(request);
      currentUserId = user.userId;
    } catch {
      // Allow unauthenticated access
    }

    // Fetch products, posts, reviews, gallery, and dynamic stats concurrently
    const [products, posts, reviews, gallery, totalProducts, totalReviews, ratingAggregate, followersCount, isFollowed] = await Promise.all([
      // 1. Latest products
      prisma.product.findMany({
        where: {
          sellerId: farmer.userId,
          isAvailable: true,
        },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { name: true } },
          images: { where: { isPrimary: true }, take: 1, select: { url: true } },
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
      // 2. Latest community posts
      prisma.communityPost.findMany({
        where: {
          farmerId: farmer.id,
        },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true, isVerified: true, userType: true },
          },
          images: {
            orderBy: { displayOrder: 'asc' },
            select: { url: true, thumbnailUrl: true },
          },
          tags: { select: { tag: true } },
          _count: { select: { likes: true, comments: true } }
        },
      }),
      // 3. Latest reviews (from their products)
      prisma.review.findMany({
        where: {
          product: {
            sellerId: farmer.userId,
          },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, avatarUrl: true } },
        },
      }),
      // 4. Gallery
      prisma.farmerGallery.findMany({
        where: { farmerId: farmer.id },
        orderBy: { createdAt: "desc" },
      }),
      // 5. Total Products
      prisma.product.count({
        where: { sellerId: farmer.userId, isAvailable: true },
      }),
      // 6. Total Reviews
      prisma.review.count({
        where: { product: { sellerId: farmer.userId } },
      }),
      // 7. Average Rating
      prisma.review.aggregate({
        where: { product: { sellerId: farmer.userId } },
        _avg: { rating: true },
      }),
      // 8. Followers Count
      prisma.farmerFollower.count({
        where: { farmerId: farmer.id },
      }),
      // 9. Is Followed by current user
      currentUserId
        ? prisma.farmerFollower.findUnique({
            where: {
              farmerId_userId: { farmerId: farmer.id, userId: currentUserId },
            },
          })
        : Promise.resolve(null),
    ]);

    // Format products exactly like farmers/[id]/products
    const formattedProducts = products.map((product) => {
      const primaryImage = product.images[0];
      const activeDiscount = product.discounts[0];

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category?.name,
        price: product.price,
        unit: product.unit,
        image_url: primaryImage?.url || null,
        is_organic: product.isOrganic,
        is_available: product.isAvailable,
        stock: product.stockQuantity,
        discount: activeDiscount?.value || null,
        rating: product.rating,
        review_count: product.reviewCount,
      };
    });

    // Format posts
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      author: {
        id: post.user.id,
        name: post.user.name,
        avatar_url: post.user.avatarUrl,
        is_verified: post.user.isVerified,
        type: post.user.userType.toLowerCase(),
      },
      likes_count: post._count.likes,
      comments_count: post._count.comments,
      created_at: post.createdAt,
      images: post.images.map((img) => img.url),
      tags: post.tags.map((t) => t.tag),
    }));

    // Format reviews
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      created_at: review.createdAt,
      user: {
        name: review.user.name,
        avatar_url: review.user.avatarUrl,
      },
    }));

    const formattedCabang = (farmer.dropPoints || []).map((dp: any) => ({
      id: dp.id,
      name: dp.name,
      description: dp.description,
      what_we_sell: dp.whatWeSell,
      latitude: dp.latitude,
      longitude: dp.longitude,
      address: dp.address,
      image_url: dp.imageUrl,
      is_active: dp.isActive,
      tags: dp.tags || [],
      operating_hours: dp.operatingHours,
      created_at: dp.createdAt,
      updated_at: dp.updatedAt,
    }));

    return NextResponse.json({
      status: "success",
      data: {
        id: farmer.id,
        user_id: farmer.user.id,
        name: farmer.name,
        description: farmer.description,
        profile_image: farmer.profileImage,
        cover_image: farmer.coverImage,
        latitude: farmer.latitude,
        longitude: farmer.longitude,
        address: farmer.address,
        city: farmer.city,
        state: farmer.state,
        rating: ratingAggregate._avg.rating || 0,
        total_reviews: totalReviews,
        total_products: totalProducts,
        specialties: farmer.specialties.map((s) => s.specialty),
        is_verified: farmer.isVerified,
        verification_badge: farmer.verificationBadge,
        has_map_feature: farmer.hasMapFeature,
        phone_number: farmer.phoneNumber,
        email: farmer.email,
        joined_date: farmer.joinedDate,
        is_online: farmer.user.isOnline,
        distance: null, // TODO: Calculate distance based on user location
        response_rate: farmer.user.profile?.responseRate || 0,
        response_time: farmer.user.profile?.responseTime,
        followers_count: followersCount,
        is_followed: !!isFollowed,
        main_location: {
          latitude: farmer.latitude,
          longitude: farmer.longitude,
          address: farmer.address,
          city: farmer.city,
          state: farmer.state,
        },
        cabang: formattedCabang,
        drop_points: formattedCabang,
        gallery: gallery.map(g => ({
          id: g.id,
          image_url: g.imageUrl,
          caption: g.caption,
          created_at: g.createdAt,
        })),
        products: formattedProducts,
        posts: formattedPosts,
        reviews: formattedReviews,
      },
    });
  } catch (error: any) {
    console.error("Error fetching farmer:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch farmer",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
