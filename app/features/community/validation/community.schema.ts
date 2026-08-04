import { z } from "zod";

export const AdminCommunityPaginationSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type AdminCommunityPaginationQuery = z.infer<typeof AdminCommunityPaginationSchema>;

// --- Core Schemas ---

export const GetPostsQuerySchema = z.object({
  filter: z.enum(["all", "following", "my_posts", "farmers"]).default("all"),
  tag: z.string().optional(),
  farmer_id: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const CreatePostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  images: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdatePostSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
});

export const AddCommentSchema = z.object({
  content: z.string().min(1, "Content is required"),
  parent_id: z.string().optional(),
  reply_to_user_id: z.string().optional(),
});

// --- Recipe Schemas ---

export const GetRecipesQuerySchema = z.object({
  search: z.string().optional(),
  author_id: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  is_featured: z.preprocess((val) => val === "true" || val === true ? true : val === "false" || val === false ? false : undefined, z.boolean().optional()),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const CreateRecipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
  prep_time_minutes: z.coerce.number().int().positive().optional(),
  cook_time_minutes: z.coerce.number().int().positive().optional(),
  servings: z.coerce.number().int().positive().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  is_featured: z.boolean().default(false).optional(),
  instructions: z.array(z.string().min(1, "Instruction step cannot be empty")).min(1, "At least one instruction step is required"),
  ingredients: z.array(z.object({
    name: z.string().min(1, "Ingredient name is required"),
    quantity: z.coerce.number().positive().optional(),
    unit: z.string().optional(),
    product_id: z.string().optional(),
  })).optional(),
});

export const UpdateRecipeSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").optional(),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
  prep_time_minutes: z.coerce.number().int().positive().optional(),
  cook_time_minutes: z.coerce.number().int().positive().optional(),
  servings: z.coerce.number().int().positive().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  is_featured: z.boolean().optional(),
  instructions: z.array(z.string().min(1, "Instruction step cannot be empty")).min(1, "At least one instruction step is required").optional(),
  ingredients: z.array(z.object({
    name: z.string().min(1, "Ingredient name is required"),
    quantity: z.coerce.number().positive().optional(),
    unit: z.string().optional(),
    product_id: z.string().optional(),
  })).optional(),
});

