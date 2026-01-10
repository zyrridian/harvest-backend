import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

/**
 * @swagger
 * /api/v1/community/posts:
 *   get:
 *     summary: Get community posts
 *     tags: [Community]
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, following, my_posts]
 *       - in: query
 *         name: tag
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
 *     responses:
 *       200:
 *         description: List of community posts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filter = searchParams.get("filter") || "all";
    const tag = searchParams.get("tag");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    let userId: string | undefined;
    try {
      const user = await verifyAuth(request);
      userId = user.userId;
    } catch (error) {
      // Allow unauthenticated access for browsing posts
    }

    const where: any = {};

    if (filter === "my_posts" && userId) {
      where.userId = userId;
    }

    if (tag) {
      where.tags = {
        some: {
          tag,
        },
      };
    }

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          images: {
            orderBy: { displayOrder: "asc" },
          },
          tags: true,
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }),
      prisma.communityPost.count({ where }),
    ]);

    // If user is authenticated, check which posts they've liked
    let postsWithLikeStatus = posts;
    if (userId) {
      const userLikes = await prisma.postLike.findMany({
        where: {
          userId,
          postId: {
            in: posts.map((p) => p.id),
          },
        },
        select: { postId: true },
      });

      const likedPostIds = new Set(userLikes.map((l) => l.postId));

      postsWithLikeStatus = posts.map((post) => ({
        ...post,
        is_liked_by_user: likedPostIds.has(post.id),
      }));
    }

    return NextResponse.json({
      status: "success",
      data: {
        posts: postsWithLikeStatus,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error("Get community posts error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to get community posts",
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/community/posts:
 *   post:
 *     summary: Create a new community post
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    const body = await request.json();

    const { title, content, images, tags } = body;

    if (!title || !content) {
      return NextResponse.json(
        {
          status: "error",
          message: "Title and content are required",
        },
        { status: 400 }
      );
    }

    const post = await prisma.communityPost.create({
      data: {
        userId: user.userId,
        title,
        content,
        images: images?.length
          ? {
              create: images.map((url: string, index: number) => ({
                url,
                displayOrder: index,
              })),
            }
          : undefined,
        tags: tags?.length
          ? {
              create: tags.map((tag: string) => ({
                tag: tag.toLowerCase(),
              })),
            }
          : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        images: true,
        tags: true,
      },
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Post created successfully",
        data: post,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create community post error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to create post",
      },
      { status: error.status || 500 }
    );
  }
}
