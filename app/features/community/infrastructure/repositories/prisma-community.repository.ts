import prisma from "@/core/database/prisma";
import { ICommunityRepository, FindPostsParams, FindCommentsParams, FindRecipesParams } from "../../domain/repositories/community.repository";
import { CommunityPostEntity, PostCommentEntity, RecipeEntity } from "../../domain/entities/community.entity";

const postInclude = {
  user: {
    select: { id: true, name: true, avatarUrl: true, userType: true },
  },
  farmer: {
    select: { id: true, name: true, profileImage: true, isVerified: true },
  },
  images: { orderBy: { displayOrder: "asc" as const } },
  tags: true,
  _count: { select: { likes: true, comments: true } },
};

const commentInclude = {
  user: { select: { id: true, name: true, avatarUrl: true } },
  replyToUser: { select: { id: true, name: true } },
  _count: { select: { likes: true } },
};

export class PrismaCommunityRepository implements ICommunityRepository {

  // --- Admin/Generic Posts ---

  async findPosts(params: FindPostsParams): Promise<CommunityPostEntity[]> {
    const { search, filter, tag, farmerId, userId, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (filter === "my_posts" && userId) where.userId = userId;
    if (filter === "farmers") where.farmerId = { not: null };
    if (farmerId) where.farmerId = farmerId;
    if (tag) where.tags = { some: { tag } };

    const posts = await prisma.communityPost.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: postInclude,
    });

    return posts as unknown as CommunityPostEntity[];
  }

  async countPosts(params: FindPostsParams): Promise<number> {
    const { search, filter, tag, farmerId, userId } = params;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (filter === "my_posts" && userId) where.userId = userId;
    if (filter === "farmers") where.farmerId = { not: null };
    if (farmerId) where.farmerId = farmerId;
    if (tag) where.tags = { some: { tag } };

    return prisma.communityPost.count({ where });
  }

  async findPostById(id: string): Promise<CommunityPostEntity | null> {
    const post = await prisma.communityPost.findUnique({
      where: { id },
      include: postInclude,
    });

    return (post as unknown as CommunityPostEntity) || null;
  }

  async deletePost(id: string): Promise<void> {
    await prisma.communityPost.delete({
      where: { id },
    });
  }

  // --- Core Posts ---

  async createPost(data: {
    userId: string;
    farmerId: string | null;
    title: string;
    content: string;
    images?: string[];
    tags?: string[];
  }): Promise<CommunityPostEntity> {
    const post = await prisma.communityPost.create({
      data: {
        userId: data.userId,
        farmerId: data.farmerId,
        title: data.title,
        content: data.content,
        images: data.images?.length
          ? {
              create: data.images.map((url: string, index: number) => ({
                url,
                displayOrder: index,
              })),
            }
          : undefined,
        tags: data.tags?.length
          ? { create: data.tags.map((tag: string) => ({ tag: tag.toLowerCase() })) }
          : undefined,
      },
      include: postInclude,
    });
    return post as unknown as CommunityPostEntity;
  }

  async updatePost(id: string, data: { title?: string; content?: string }): Promise<CommunityPostEntity> {
    const updated = await prisma.communityPost.update({
      where: { id },
      data,
      include: postInclude,
    });
    return updated as unknown as CommunityPostEntity;
  }

  async findUserPostLikes(userId: string, postIds: string[]): Promise<string[]> {
    const likes = await prisma.postLike.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true },
    });
    return likes.map((l) => l.postId);
  }

  async likePost(postId: string, userId: string): Promise<void> {
    await prisma.$transaction([
      prisma.postLike.create({ data: { postId, userId } }),
      prisma.communityPost.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      }),
    ]);
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    await prisma.$transaction([
      prisma.postLike.delete({
        where: { postId_userId: { postId, userId } },
      }),
      prisma.communityPost.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);
  }

  async checkPostLike(postId: string, userId: string): Promise<boolean> {
    const like = await prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });
    return !!like;
  }

  async getFarmerIdByUserId(userId: string): Promise<string | null> {
    const farmer = await prisma.farmer.findUnique({
      where: { userId },
      select: { id: true },
    });
    return farmer?.id || null;
  }

  // --- Admin/Generic Comments ---

  async findComments(params: FindCommentsParams): Promise<PostCommentEntity[]> {
    const { search, postId, parentId, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.content = { contains: search, mode: "insensitive" };
    }
    if (postId) where.postId = postId;
    if (parentId !== undefined) where.parentId = parentId;

    const comments = await prisma.postComment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        ...commentInclude,
        post: {
          select: { id: true, title: true },
        },
        replies: {
          orderBy: { createdAt: "asc" },
          include: commentInclude,
        },
      },
    });

    return comments as unknown as PostCommentEntity[];
  }

  async countComments(params: FindCommentsParams): Promise<number> {
    const { search, postId, parentId } = params;

    const where: any = {};
    if (search) {
      where.content = { contains: search, mode: "insensitive" };
    }
    if (postId) where.postId = postId;
    if (parentId !== undefined) where.parentId = parentId;

    return prisma.postComment.count({ where });
  }

  async findCommentById(id: string): Promise<PostCommentEntity | null> {
    const comment = await prisma.postComment.findUnique({
      where: { id },
      include: {
        ...commentInclude,
        post: {
          select: { id: true, title: true },
        },
      },
    });

    return (comment as unknown as PostCommentEntity) || null;
  }

  async deleteComment(id: string): Promise<void> {
    await prisma.$transaction(async (tx: any) => {
      const comment = await tx.postComment.findUnique({
        where: { id }
      });
      
      if (comment) {
        await tx.postComment.delete({
          where: { id },
        });

        await tx.communityPost.update({
          where: { id: comment.postId },
          data: {
            commentsCount: {
              decrement: 1,
            },
          },
        });
      }
    });
  }

  // --- Core Comments ---

  async addComment(data: {
    postId: string;
    userId: string;
    parentId?: string | null;
    replyToUserId?: string | null;
    content: string;
  }): Promise<PostCommentEntity> {
    const [comment] = await prisma.$transaction([
      prisma.postComment.create({
        data: {
          postId: data.postId,
          userId: data.userId,
          parentId: data.parentId,
          replyToUserId: data.replyToUserId,
          content: data.content,
        },
        include: {
          ...commentInclude,
          replies: {
            orderBy: { createdAt: "asc" },
            include: commentInclude,
          },
        },
      }),
      prisma.communityPost.update({
        where: { id: data.postId },
        data: { commentsCount: { increment: 1 } },
      }),
    ]);
    return comment as unknown as PostCommentEntity;
  }

  async findUserCommentLikes(userId: string, commentIds: string[]): Promise<string[]> {
    const likes = await prisma.commentLike.findMany({
      where: { userId, commentId: { in: commentIds } },
      select: { commentId: true },
    });
    return likes.map((l) => l.commentId);
  }

  async likeComment(commentId: string, userId: string): Promise<void> {
    await prisma.$transaction([
      prisma.commentLike.create({
        data: { commentId, userId },
      }),
      prisma.postComment.update({
        where: { id: commentId },
        data: { likesCount: { increment: 1 } },
      }),
    ]);
  }

  async unlikeComment(commentId: string, userId: string): Promise<void> {
    await prisma.$transaction([
      prisma.commentLike.delete({
        where: { commentId_userId: { commentId, userId } },
      }),
      prisma.postComment.update({
        where: { id: commentId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);
  }

  async checkCommentLike(commentId: string, userId: string): Promise<boolean> {
    const like = await prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId, userId } },
    });
    return !!like;
  }

  // --- Tags ---

  async getTrendingTags(limit: number): Promise<string[]> {
    const tags = await prisma.postTag.groupBy({
      by: ['tag'],
      _count: {
        tag: true,
      },
      orderBy: {
        _count: {
          tag: 'desc',
        },
      },
      take: limit,
    });

    return tags.map((t) => t.tag);
  }

  // --- Recipes ---

  async findRecipes(params: FindRecipesParams): Promise<RecipeEntity[]> {
    const { search, authorId, difficulty, isFeatured, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (authorId) where.authorId = authorId;
    if (difficulty) where.difficulty = difficulty;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;

    const recipes = await prisma.recipe.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
        ingredients: true,
      },
    });

    return recipes as unknown as RecipeEntity[];
  }

  async countRecipes(params: FindRecipesParams): Promise<number> {
    const { search, authorId, difficulty, isFeatured } = params;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (authorId) where.authorId = authorId;
    if (difficulty) where.difficulty = difficulty;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;

    return prisma.recipe.count({ where });
  }

  async findRecipeById(id: string): Promise<RecipeEntity | null> {
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
        ingredients: true,
      },
    });

    return (recipe as unknown as RecipeEntity) || null;
  }

  async createRecipe(data: {
    authorId: string;
    title: string;
    description?: string;
    imageUrl?: string;
    prepTimeMinutes?: number;
    cookTimeMinutes?: number;
    servings?: number;
    difficulty?: string;
    isFeatured?: boolean;
    instructions: string[];
    ingredients?: Array<{
      name: string;
      quantity?: number;
      unit?: string;
      productId?: string;
    }>;
  }): Promise<RecipeEntity> {
    const recipe = await prisma.recipe.create({
      data: {
        authorId: data.authorId,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        prepTimeMinutes: data.prepTimeMinutes,
        cookTimeMinutes: data.cookTimeMinutes,
        servings: data.servings,
        difficulty: data.difficulty,
        isFeatured: data.isFeatured ?? false,
        instructions: data.instructions,
        ingredients: data.ingredients?.length
          ? {
              create: data.ingredients.map((ing) => ({
                name: ing.name,
                quantity: ing.quantity,
                unit: ing.unit,
                productId: ing.productId,
              })),
            }
          : undefined,
      },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
        ingredients: true,
      },
    });

    return recipe as unknown as RecipeEntity;
  }

  async updateRecipe(id: string, data: Partial<{
    title: string;
    description: string | null;
    imageUrl: string | null;
    prepTimeMinutes: number | null;
    cookTimeMinutes: number | null;
    servings: number | null;
    difficulty: string;
    isFeatured: boolean;
    instructions: string[];
    ingredients: Array<{
      name: string;
      quantity?: number;
      unit?: string;
      productId?: string;
    }>;
  }>): Promise<RecipeEntity> {
    const updateData: any = { ...data };
    
    // If ingredients are provided, we replace the existing ones completely
    // since Prisma doesn't have a simple way to sync nested arrays without delete/create
    if (data.ingredients) {
      updateData.ingredients = {
        deleteMany: {},
        create: data.ingredients.map((ing) => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          productId: ing.productId,
        })),
      };
    }

    const updated = await prisma.recipe.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
        ingredients: true,
      },
    });

    return updated as unknown as RecipeEntity;
  }

  async deleteRecipe(id: string): Promise<void> {
    // Ingredients will be cascade-deleted if configured in Prisma schema, 
    // otherwise we might need to delete them first. Let's assume cascade is set up or we delete manually.
    await prisma.$transaction([
      prisma.recipeIngredient.deleteMany({ where: { recipeId: id } }),
      prisma.recipe.delete({ where: { id } }),
    ]);
  }
}

export const communityRepository = new PrismaCommunityRepository();
