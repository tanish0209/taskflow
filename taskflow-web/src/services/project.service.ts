import { prisma } from "@/lib/prisma";
import {
  CreateProjectInput,
  createProjectSchema,
  UpdateProjectInput,
  updateProjectSchema,
} from "@/schemas/project.schema";
import { notificationService } from "./notification.service";
import { emitSocketEvent } from "@/lib/socketEmitter";
import { logEvent } from "@/lib/logger";

export const ProjectService = {
  async createProject(data: CreateProjectInput) {
    const validatedData = createProjectSchema.parse(data);

    const existingProject = await prisma.project.findFirst({
      where: {
        name: validatedData.name,
        ownerId: validatedData.ownerId,
      },
    });

    if (existingProject) {
      throw new Error("Project with this name already exists for this user");
    }

    const newProject = await prisma.project.create({
      data: validatedData,
    });

    await emitSocketEvent("project-created", {
      room: `user_${validatedData.ownerId}`,
      data: newProject,
    });

    await logEvent("Project Created", {
      userId: validatedData.ownerId,
      details: `Project ${validatedData.name} created by ${validatedData.ownerId}`,
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
    const validatedData = updateProjectSchema.parse(data);

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
      data: validatedData,
    });

    if (
      validatedData.status &&
      validatedData.status !== existingProject.status
    ) {
      const members = existingProject.projectMember;

      await logEvent("Project Status Changed", {
        projectId: id,
        details: `Project Status Changed from ${existingProject.status} to ${validatedData.status}`,
      });

      for (const member of members) {
        await notificationService.createNotification({
          type: "status_update",
          message: `Project "${existingProject.name}" status changed to ${validatedData.status}`,
          userId: member.userId,
          isRead: false,
        });
      }

      if (!members.some((m) => m.userId === existingProject.ownerId)) {
        await notificationService.createNotification({
          type: "status_update",
          message: `Project "${existingProject.name}" status changed to ${validatedData.status}`,
          userId: existingProject.ownerId,
          isRead: false,
        });
      }
    }

    await emitSocketEvent("project-updated", {
      room: `project_${id}`,
      data: updatedProject,
    });

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

    // 🔔 Real-time update to project room
    await emitSocketEvent("project-deleted", {
      room: `project_${id}`,
      data: { id },
    });

    return { message: "Project deleted successfully" };
  },
};
