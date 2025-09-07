import { z } from "zod";
export const projectStatusEnum = z.enum(["active", "archived", "completed"]);
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(4, { error: "Project Title is too short" })
    .max(100, { error: "Project Title is too long" }),
  description: z.string().optional(),
  status: projectStatusEnum.default("active"),
  ownerId: z.cuid({ error: "Invalid owner Id" }),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z.string().min(4).max(100).optional(),
  description: z.string().optional().nullable(),
  status: projectStatusEnum.optional(),
});
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
