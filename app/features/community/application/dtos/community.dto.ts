import { CommunityPostEntity, PostCommentEntity, RecipeEntity } from "../../domain/entities/community.entity";

export interface GetAdminPostsInputDTO {
  search?: string;
  page: number;
  limit: number;
}

export interface PaginatedAdminPostsDTO {
  posts: CommunityPostEntity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface GetAdminCommentsInputDTO {
  search?: string;
  page: number;
  limit: number;
}

export interface PaginatedAdminCommentsDTO {
  comments: PostCommentEntity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// --- Core DTOs ---

export interface GetPostsInputDTO {
  filter?: string;
  tag?: string;
  farmerId?: string;
  page: number;
  limit: number;
  currentUserId?: string;
}

export interface PaginatedPostsDTO {
  posts: CommunityPostEntity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface CreatePostInputDTO {
  title: string;
  content: string;
  images?: string[];
  tags?: string[];
  userId: string;
}

export interface UpdatePostInputDTO {
  id: string;
  title?: string;
  content?: string;
  userId: string;
}

export interface GetPostCommentsInputDTO {
  postId: string;
  page: number;
  limit: number;
  currentUserId?: string;
}

export interface PaginatedCommentsDTO {
  comments: PostCommentEntity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface AddCommentInputDTO {
  postId: string;
  userId: string;
  content: string;
  parentId?: string;
  replyToUserId?: string;
}

// --- Recipe DTOs ---

export interface GetRecipesInputDTO {
  search?: string;
  authorId?: string;
  difficulty?: string;
  isFeatured?: boolean;
  page: number;
  limit: number;
}

export interface PaginatedRecipesDTO {
  recipes: RecipeEntity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface CreateRecipeInputDTO {
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
}

export interface UpdateRecipeInputDTO {
  id: string;
  authorId: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  difficulty?: string;
  isFeatured?: boolean;
  instructions?: string[];
  ingredients?: Array<{
    name: string;
    quantity?: number;
    unit?: string;
    productId?: string;
  }>;
}
