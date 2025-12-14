import { prisma } from "@/lib/prisma";
import { getIO } from "@/lib/socketServer";
import {
  CreateProjectInput,
  createProjectSchema,
  UpdateProjectInput,
  updateProjectSchema,
} from "@/schemas/project.schema";
import { notificationService } from "./notification.service";
import { logEvent } from "@/lib/logger";
export const ProjectService = {
  async createProject(data: CreateProjectInput) {
    const ValidatedData = createProjectSchema.parse(data);

    const existingProject = await prisma.project.findFirst({
      where: {
        name: ValidatedData.name,
        ownerId: ValidatedData.ownerId,
      },
    });
    if (existingProject)
      throw new Error("Project with this name already exists for this user");
    const newProject = await prisma.project.create({
      data: ValidatedData,
    });
    const io = getIO();
    io.to(`user_${ValidatedData.ownerId}`).emit("project-created", newProject);
    await logEvent("Project Created", {
      userId: ValidatedData.ownerId,
      details: `Project ${ValidatedData.name} created by ${ValidatedData.ownerId}`,
    });
    return newProject;
  },
  async getAllProjects(queryParams: { overview?: boolean } = {}) {
    const { overview = false } = queryParams;
    if (overview) {
      return prisma.project.findMany({
        select: {
          name: true,
          description: true,
          createdAt: true,
          status: true,
        },
      });
    }
    return prisma.project.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        status: true,
        description: true,
        projectMember: true,
        tasks: true,
        owner: true,
        joinRequest: true,
      },
    });
  },

  async getProjectsByUser(userId: string) {
    return prisma.project.findMany({
      where: {
        OR: [{ ownerId: userId }, { projectMember: { some: { userId } } }],
      },
      include: {
        tasks: true,
        projectMember: true,
        owner: true,
      },
    });
  },

  async getProjectById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: true,
        tasks: true,
        attachments: true,
        activityLogs: true,
        projectMember: true,
      },
    });
    if (!project) throw new Error("Project not found");
    return project;
  },
  async updateProject(data: UpdateProjectInput, id: string) {
    const ValidatedData = updateProjectSchema.parse(data);
    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: {
        projectMember: { include: { user: true } },
      },
    });

    if (!existingProject) {
      throw new Error("Project not found");
    }

    const updatedProject = await prisma.project.update({
      where: { id },

      data: ValidatedData,
    });
    if (
      ValidatedData.status &&
      ValidatedData.status !== existingProject.status
    ) {
      const members = existingProject.projectMember;
      await logEvent("Project Status Changed", {
        projectId: id,
        details: `Project Status Changed from ${existingProject.status} to ${ValidatedData.status}`,
      });
      for (const member of members) {
        await notificationService.createNotification({
          type: "status_update",
          message: `Project "${existingProject.name}" status changed to ${ValidatedData.status}`,
          userId: member.userId,
          isRead: false,
        });
      }
      if (!members.some((m) => m.userId === existingProject.ownerId)) {
        await notificationService.createNotification({
          type: "status_update",
          message: `Project "${existingProject.name}" status changed to ${ValidatedData.status}`,
          userId: existingProject.ownerId,
          isRead: false,
        });
      }
    }
    const io = getIO();
    io.to(`project_${id}`).emit("project-updated", updatedProject);
    await logEvent("Project Updated", {
      projectId: id,
      details: `Project ${existingProject.name} updated by ${existingProject.ownerId}`,
    });
    return updatedProject;
  },
  async deleteProject(id: string) {
    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: {
        projectMember: { include: { user: true } },
      },
    });

    if (!existingProject) {
      throw new Error("Project not found");
    }
    const members = existingProject.projectMember;
    for (const member of members) {
      await notificationService.createNotification({
        type: "status_update",
        message: `Project "${existingProject.name}" has been deleted`,
        userId: member.userId,
        isRead: false,
      });
    }
    await prisma.project.delete({
      where: { id },
    });
    await logEvent("Project Deleted", {
      projectId: id,
      details: `Project ${existingProject.name} deleted`,
    });
    const io = getIO();
    io.to(`project_${id}`).emit("project-deleted", { id });
    return { message: "Project deleted successfully" };
  },
};
