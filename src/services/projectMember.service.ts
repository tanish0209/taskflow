import { prisma } from "@/lib/prisma";
import {
  createProjectMemberSchema,
  CreateProjectMemberInput,
  updateProjectMemberSchema,
  UpdateProjectMemberInput,
} from "@/schemas/projectMember.schema";

export const projectMemberService = {
  // Add user to project
  async addMember(data: CreateProjectMemberInput) {
    const validatedData = createProjectMemberSchema.parse(data);

    // Check if already a member
    const existing = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: validatedData.projectId,
          userId: validatedData.userId,
        },
      },
    });
    if (existing) throw new Error("User is already a member of this project");

    return prisma.projectMember.create({
      data: validatedData,
    });
  },

  // Remove user from project
  async removeMember(projectId: string, userId: string) {
    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (!existing) throw new Error("User is not a member of this project");

    return prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });
  },

  // Update member role
  async updateMemberRole(
    projectId: string,
    userId: string,
    data: UpdateProjectMemberInput
  ) {
    const validatedData = updateProjectMemberSchema.parse(data);

    return prisma.projectMember.update({
      where: { projectId_userId: { projectId, userId } },
      data: validatedData,
    });
  },

  // List all members of a project
  async getMembersByProject(projectId: string) {
    return prisma.projectMember.findMany({
      where: { projectId },
      include: { user: true },
    });
  },

  // List all projects a user belongs to
  async getProjectsForUser(userId: string) {
    return prisma.projectMember.findMany({
      where: { userId },
      include: { project: true },
    });
  },
};
