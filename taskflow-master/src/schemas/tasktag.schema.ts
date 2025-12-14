import { z } from "zod";
export const createTaskTagSchema = z.object({
  taskId: z.cuid({ error: "Invalid taskId" }),
  tagId: z.cuid({ error: "Invalid tagId" }),
});
export type createTaskTagInput = z.infer<typeof createTaskTagSchema>;
