import { z } from "zod";

export const createActivityLogSchema = z.object({
  action: z.string().min(2, "Action must be at least 2 characters"),

  userId: z.cuid({ error: "Invalid User ID" }).optional().nullable(),
  taskId: z.cuid({ error: "Invalid Task ID" }).optional().nullable(),
  projectId: z.cuid({ error: "Invalid Project ID" }).optional().nullable(),
});

export type CreateActivityLogInput = z.infer<typeof createActivityLogSchema>;

export const updateActivityLogSchema = z.object({
  action: z.string().min(2).optional(),

  userId: z.cuid().optional().nullable(),
  taskId: z.cuid().optional().nullable(),
  projectId: z.cuid().optional().nullable(),
});

export type UpdateActivityLogInput = z.infer<typeof updateActivityLogSchema>;
