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

    // Fire side-effects without blocking response
    Promise.allSettled([
      emitSocketEvent("project-created", {
        room: `user_${validatedData.ownerId}`,
        data: newProject,
      }),
      logEvent("Project Created", {
        userId: validatedData.ownerId,
        details: `Project ${validatedData.name} created`,
      }),
    ]).catch(console.error);

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
        ownerId: true,
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true, projectMember: true, joinRequest: true } },
      },
    });
  },

  async getProjectsByUser(userId: string) {
    return prisma.project.findMany({
      where: {
        OR: [{ ownerId: userId }, { projectMember: { some: { userId } } }],
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        createdAt: true,
        ownerId: true,
        owner: { select: { id: true, name: true } },
        tasks: {
          select: { id: true, status: true, projectId: true },
        },
        _count: { select: { projectMember: true } },
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

    // Fire side-effects in parallel without blocking response
    const sideEffects: Promise<unknown>[] = [
      logEvent("Project Updated", {
        projectId: id,
        details: `Project ${existingProject.name} updated`,
      }),
      emitSocketEvent("project-updated", {
        room: `project_${id}`,
        data: updatedProject,
      }),
    ];

    if (
      validatedData.status &&
      validatedData.status !== existingProject.status
    ) {
      const members = existingProject.projectMember;

      sideEffects.push(
        logEvent("Project Status Changed", {
          projectId: id,
          details: `Project Status Changed from ${existingProject.status} to ${validatedData.status}`,
        })
      );

      // Send notifications to all members in parallel instead of sequentially
      const notifyUserIds = members.map((m) => m.userId);
      if (!notifyUserIds.includes(existingProject.ownerId)) {
        notifyUserIds.push(existingProject.ownerId);
      }

      for (const userId of notifyUserIds) {
        sideEffects.push(
          notificationService.createNotification({
            type: "status_update",
            message: `Project "${existingProject.name}" status changed to ${validatedData.status}`,
            userId,
            isRead: false,
          })
        );
      }
    }

    Promise.allSettled(sideEffects).catch(console.error);

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

    // Fire all side-effects in parallel without blocking
    const sideEffects: Promise<unknown>[] = [
      logEvent("Project Deleted", {
        projectId: id,
        details: `Project ${existingProject.name} deleted`,
      }),
      emitSocketEvent("project-deleted", {
        room: `project_${id}`,
        data: { id },
      }),
      // Notify all members in parallel
      ...members.map((member) =>
        notificationService.createNotification({
          type: "status_update",
          message: `Project "${existingProject.name}" has been deleted`,
          userId: member.userId,
          isRead: false,
        })
      ),
    ];

    Promise.allSettled(sideEffects).catch(console.error);

    await prisma.project.delete({ where: { id } });
    return { message: "Project deleted successfully" };
  },
};
