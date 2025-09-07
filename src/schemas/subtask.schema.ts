import { z } from "zod";
export const subTaskStatusEnum = z.enum(["todo", "done"]);
export const createSubTaskSchema = z.object({
  title: z
    .string()
    .min(4, { error: "Subtask title is too short" })
    .max(100, { error: "Substask title is too long" }),
  subtaskStatus: subTaskStatusEnum.default("todo"),
  taskId: z.cuid({ error: "Invalid task ID" }),
});
export type createSubTaskInput = z.infer<typeof createSubTaskSchema>;

export const updateSubTaskSchema = z.object({
  title: z.string().min(4).max(100).optional(),
  subtaskStatus: subTaskStatusEnum.optional(),
  taskId: z.cuid().optional(),
});
export type updateSubTaskInput = z.infer<typeof updateSubTaskSchema>;
