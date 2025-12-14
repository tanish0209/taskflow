import { z } from "zod";
export const createTagSchema = z.object({
  name: z.string().min(1, "Tag name cannot be empty"),
});
export type createTagInput = z.infer<typeof createTagSchema>;
export const updateTagSchema = z.object({
  name: z.string().min(1).optional(),
});
export type updateTagInput = z.infer<typeof updateTagSchema>;
