import { prisma } from "@/lib/prisma";
import {
  createProjectMemberSchema,
  CreateProjectMemberInput,
  updateProjectMemberSchema,
  UpdateProjectMemberInput,
} from "@/schemas/projectMember.schema";
import { notificationService } from "./notification.service";
import { emitSocketEvent } from "@/lib/socketEmitter";

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

    const memberAdded = await prisma.projectMember.create({
      data: validatedData,
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });

    // 🔔 Notify added user
    await notificationService.createNotification({
      type: "status_update",
      message: `You have been added to the project "${project?.name}"`,
      userId: validatedData.userId,
      isRead: false,
    });

    // 🔔 Real-time update to project room
    await emitSocketEvent("projectmember-added", {
      room: `project_${validatedData.projectId}`,
      data: memberAdded,
    });

    return memberAdded;
  },

  async removeMember(projectId: string, userId: string) {
    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (!existing) throw new Error("User is not a member of this project");

    const memberRemoved = await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });

    const project = await prisma.project.findUnique({
      where: { id: existing.projectId },
      select: { name: true },
    });

    // 🔔 Notify removed user
    await notificationService.createNotification({
      type: "status_update",
      message: `You have been removed from the project "${project?.name}"`,
      userId,
      isRead: false,
    });

    // 🔔 Real-time update to project room
    await emitSocketEvent("projectmember-removed", {
      room: `project_${projectId}`,
      data: memberRemoved,
    });

    return memberRemoved;
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
        userId,
        isRead: false,
      });
    }

    // 🔔 Real-time update to project room
    await emitSocketEvent("memberrole-updated", {
      room: `project_${projectId}`,
      data: memberRoleUpdated,
    });

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
