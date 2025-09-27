import { z } from "zod";
export const taskPriorityEnum = z.enum(["low", "medium", "high"]);
export const taskStatusEnum = z.enum(["todo", "in_progress", "review", "done"]);
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(4, { error: "Title length is too short" })
    .max(100, { error: "Title Length is too long" }),
  description: z.string(),
  priority: taskPriorityEnum.default("medium"),
  status: taskStatusEnum.default("todo"),
  dueDate: z.iso.datetime().optional(),
  startDate: z.iso.datetime().optional(),
  completedAt: z.iso.datetime().optional(),

  projectId: z.cuid({ error: "Invalid Project Id" }),
  assigneeId: z.cuid({ error: "Invalid Assignee Id" }),
});
export type createTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  title: z.string().min(4).max(100).optional(),
  description: z.string().optional().nullable(),
  priority: taskPriorityEnum.optional(),
  status: taskStatusEnum.optional(),
  dueDate: z.iso.datetime().optional().nullable(),
  startDate: z.iso.datetime().optional().nullable(),
  completedAt: z.iso.datetime().optional().nullable(),

  projectId: z.cuid().optional(),
  assigneeId: z.cuid().optional().nullable(),
});
export type updateTaskInput = z.infer<typeof updateTaskSchema>;
