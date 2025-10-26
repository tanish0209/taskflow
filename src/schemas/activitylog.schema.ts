import { z } from "zod";

export const createActivityLogSchema = z.object({
  action: z.string().min(2, "Action must be at least 2 characters"),

  userId: z.cuid({ error: "Invalid User ID" }).optional().nullable(),
  taskId: z.cuid({ error: "Invalid Task ID" }).optional().nullable(),
  projectId: z.cuid({ error: "Invalid Project ID" }).optional().nullable(),
  details: z.string().optional(),
});

export type CreateActivityLogInput = z.infer<typeof createActivityLogSchema>;
