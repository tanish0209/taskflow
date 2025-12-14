import { z } from "zod";

export const projectRoleEnum = z.enum(["MEMBER", "MANAGER"]);

export const createProjectMemberSchema = z.object({
  userId: z.cuid("Invalid user ID"),
  projectId: z.cuid("Invalid project ID"),
  role: projectRoleEnum.default("MEMBER"),
});

export type CreateProjectMemberInput = z.infer<
  typeof createProjectMemberSchema
>;

export const updateProjectMemberSchema = z.object({
  role: projectRoleEnum.optional(),
});

export type UpdateProjectMemberInput = z.infer<
  typeof updateProjectMemberSchema
>;
