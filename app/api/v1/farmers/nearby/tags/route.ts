import { NextResponse } from "next/server";
import prisma from "@/core/database/prisma";
import { logger } from "@/core/logger";
import redis from "@/core/database/redis";

/**
 * @swagger
 * /api/v1/farmers/nearby/tags:
 *   get:
 *     summary: Get all available tags and categories for nearby farmers
 *     tags: [Farmers]
 *     responses:
 *       200:
 *         description: List of unique tags
 */
export async function GET() {
  try {
    const cacheKey = "farmers:nearby:tags";
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      logger.info({ cacheKey }, "⚡ Cache hit! Returning nearby tags from Redis.");
      return NextResponse.json({
        status: "success",
        data: JSON.parse(cachedData),
        source: "cache",
      });
    }

    logger.info({ cacheKey }, "🐢 Cache miss. Fetching nearby tags from Postgres...");

    // Using raw SQL for efficiency to unnest the array and get distinct values
    const tagsResult = await prisma.$queryRaw<{tag: string}[]>`
      SELECT DISTINCT unnest(tags) as tag
      FROM drop_points
      WHERE is_active = true AND tags IS NOT NULL
    `;
    
    const uniqueTags = tagsResult.map(row => row.tag).filter(Boolean);

    // Also get categories from whatWeSell
    const categoriesResult = await prisma.$queryRaw<{category: string}[]>`
      SELECT DISTINCT what_we_sell as category
      FROM drop_points
      WHERE is_active = true AND what_we_sell IS NOT NULL
    `;
    
    const uniqueCategories = categoriesResult.map(row => row.category).filter(Boolean);

    const data = {
      tags: uniqueTags,
      categories: uniqueCategories
    };

    // Cache the result for 1 hour (3600 seconds)
    await redis.setex(cacheKey, 3600, JSON.stringify(data));
    logger.info({ cacheKey, tagsCount: uniqueTags.length }, "💾 Saved nearby tags to Redis cache!");

    return NextResponse.json({
      status: "success",
      data,
    });
  } catch (error: any) {
    logger.error({ err: error }, "Error fetching nearby tags");
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch tags",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
