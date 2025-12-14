import { z } from "zod";
export const createCommentSchema = z.object({
  content: z.string().min(1, { error: "Comment cannot be empty" }),
  taskId: z.cuid({ error: "Invalid task id" }),
  authorId: z.cuid({ error: "Invalid author Id" }),
});
export type createCommentInput = z.infer<typeof createCommentSchema>;

export const updateCommentSchema = z.object({
  content: z.string().min(1).optional(),
  taskId: z.cuid().optional(),
  authorId: z.cuid().optional(),
});
export type updateCommentInput = z.infer<typeof updateCommentSchema>;
