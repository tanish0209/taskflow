import { prisma } from "@/lib/prisma";
import { getIO } from "@/lib/socketServer";
import {
  createProjectMemberSchema,
  CreateProjectMemberInput,
  updateProjectMemberSchema,
  UpdateProjectMemberInput,
} from "@/schemas/projectMember.schema";
import { notificationService } from "./notification.service";

export const projectMemberService = {
  async addMember(data: CreateProjectMemberInput) {
    const validatedData = createProjectMemberSchema.parse(data);

    const existing = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: validatedData.projectId,
          userId: validatedData.userId,
        },
      },
    });
    if (existing) throw new Error("User is already a member of this project");
    const project = await prisma.project.findUnique({
      where: { id: validatedData.projectId },
      select: { name: true, ownerId: true },
    });

    const memberAdd = await prisma.projectMember.create({
      data: validatedData,
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });
    await notificationService.createNotification({
      type: "status_update",
      message: `You have been added to the project "${project?.name}"`,
      userId: validatedData.userId,
      isRead: false,
    });
    const io = getIO();
    io.to(`project_${validatedData.projectId}`).emit(
      "projectmember-added",
      memberAdd
    );
    return memberAdd;
  },

  async removeMember(projectId: string, userId: string) {
    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (!existing) throw new Error("User is not a member of this project");
    const memberRemove = await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });
    const project = await prisma.project.findUnique({
      where: { id: existing.projectId },
      select: { name: true },
    });
    await notificationService.createNotification({
      type: "status_update",
      message: `You have been removed from the project "${project?.name}"`,
      userId: userId,
      isRead: false,
    });
    const io = getIO();
    io.to(`project_${projectId}`).emit("projectmember-removed", memberRemove);
    return memberRemove;
  },

  async updateMemberRole(
    projectId: string,
    userId: string,
    data: UpdateProjectMemberInput
  ) {
    const validatedData = updateProjectMemberSchema.parse(data);
    const memberRoleUpdated = await prisma.projectMember.update({
      where: { projectId_userId: { projectId, userId } },
      data: validatedData,
    });
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true },
    });
    if (validatedData.role) {
      await notificationService.createNotification({
        type: "status_update",
        message: `Your role in project "${project?.name}" has been updated to ${validatedData.role}`,
        userId: userId,
        isRead: false,
      });
    }
    const io = getIO();
    io.to(`project_${projectId}`).emit("memberrole-updated", memberRoleUpdated);
    return memberRoleUpdated;
  },

  async getMembersByProject(projectId: string) {
    return prisma.projectMember.findMany({
      where: { projectId },
      include: { user: true },
    });
  },

  async getProjectsForUser(userId: string) {
    return prisma.projectMember.findMany({
      where: { userId },
      include: { project: true },
    });
  },
};
