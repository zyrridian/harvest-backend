import { z } from "zod";

export const UpdateProfileSchema = z.object({
  name: z.string().optional(),
  phone_number: z.string().optional(),
  bio: z.string().optional(),
  avatar_url: z.string().url().optional(),
}).strict();

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
