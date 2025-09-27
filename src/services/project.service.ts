import { prisma } from "@/lib/prisma";
import {
  CreateProjectInput,
  createProjectSchema,
  UpdateProjectInput,
  updateProjectSchema,
} from "@/schemas/project.schema";
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
    return newProject;
  },
  async getAllProjects() {
    return prisma.project.findMany({
      include: {
        owner: true,
        projectMember: true,
        tasks: true,
      },
    });
  },

  async getProjectsByUser(userId: string) {
    return prisma.project.findMany({
      where: {
        projectMember: { some: { userId } },
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
      },
    });
    if (!project) throw new Error("Project not found");
    return project;
  },
  async updateProject(data: UpdateProjectInput, id: string) {
    const ValidatedData = updateProjectSchema.parse(data);
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw new Error("Project not found");
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: ValidatedData,
    });

    return updatedProject;
  },
  async deleteProject(id: string) {
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw new Error("Project not found");
    }

    await prisma.project.delete({
      where: { id },
    });

    return { message: "Project deleted successfully" };
  },
};
