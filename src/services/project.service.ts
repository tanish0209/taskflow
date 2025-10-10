import { prisma } from "@/lib/prisma";
import {
  CreateProjectInput,
  createProjectSchema,
  UpdateProjectInput,
  updateProjectSchema,
} from "@/schemas/project.schema";

export const ProjectService = {
  async createProject(data: CreateProjectInput) {
    const validatedData = createProjectSchema.parse(data);

    const existingProject = await prisma.project.findFirst({
      where: {
        name: validatedData.name,
        ownerId: validatedData.ownerId,
      },
    });
    if (existingProject)
      throw new Error("Project with this name already exists for this user");

    return prisma.project.create({
      data: validatedData,
      include: {
        tasks: true,
        attachments: true,
        projectMember: true,
        activityLogs: true,
        owner: true,
      },
    });
  },

  async getAllProjects() {
    return prisma.project.findMany({
      include: {
        tasks: true,
        attachments: true,
        projectMember: true,
        activityLogs: true,
        owner: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getProjectsByUser(userId: string) {
    return prisma.project.findMany({
      where: {
        OR: [{ ownerId: userId }, { projectMember: { some: { userId } } }],
      },
      include: {
        tasks: true,
        attachments: true,
        projectMember: true,
        activityLogs: true,
        owner: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getProjectById(id: string) {
    return prisma.project.findUniqueOrThrow({
      where: { id },
      include: {
        tasks: true,
        attachments: true,
        projectMember: true,
        activityLogs: true,
        owner: true,
      },
    });
  },

  async updateProject(data: UpdateProjectInput, id: string) {
    const validatedData = updateProjectSchema.parse(data);
    try {
      return prisma.project.update({
        where: { id },
        data: validatedData,
        include: {
          tasks: true,
          attachments: true,
          projectMember: true,
          activityLogs: true,
          owner: true,
        },
      });
    } catch {
      throw new Error("Project not found");
    }
  },

  async deleteProject(id: string) {
    try {
      await prisma.project.delete({ where: { id } });
      return { message: "Project deleted successfully" };
    } catch {
      throw new Error("Project not found");
    }
  },
};
