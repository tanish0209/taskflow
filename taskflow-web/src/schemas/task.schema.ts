import { z } from "zod";
export const taskPriorityEnum = z.enum(["low", "medium", "high"]);
export const taskStatusEnum = z.enum(["todo", "in_progress", "review", "done"]);
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(4, { error: "Title length is too short" })
    .max(100, { error: "Title Length is too long" }),
  description: z.string().nullable().optional(),
  priority: taskPriorityEnum.default("medium"),
  status: taskStatusEnum.default("todo"),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
  startDate: z.string().datetime({ offset: true }).optional().nullable(),
  completedAt: z.string().datetime({ offset: true }).optional().nullable(),

  projectId: z.cuid({ error: "Invalid Project Id" }),
  assigneeId: z.cuid({ error: "Invalid Assignee Id" }).optional().nullable(),
  ownerId: z.cuid({ error: "Invalid Owner Id" }),
});
export type createTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  title: z.string().min(4).max(100).optional(),
  description: z.string().optional().nullable(),
  priority: taskPriorityEnum.optional(),
  status: taskStatusEnum.optional(),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
  startDate: z.string().datetime({ offset: true }).optional().nullable(),
  completedAt: z.string().datetime({ offset: true }).optional().nullable(),

  projectId: z.cuid().optional(),
  assigneeId: z.cuid().optional().nullable(),
  ownerId: z.cuid().optional().nullable(),
});
export type updateTaskInput = z.infer<typeof updateTaskSchema>;
