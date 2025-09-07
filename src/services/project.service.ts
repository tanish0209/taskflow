import { prisma } from "@/lib/prisma";
import {
  CreateProjectInput,
  createProjectSchema,
  UpdateProjectInput,
  updateProjectSchema,
} from "@/schemas/project.schema";
export const createProjectService = {
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
      include: { owner: true },
    });
  },
  async getProjectById(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { projectId },
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
  async updateProject(data: UpdateProjectInput, projectId: string) {
    const ValidatedData = updateProjectSchema.parse(data);
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      throw new Error("Project not found");
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: ValidatedData,
    });

    return updatedProject;
  },
  async deleteProject(projectId: string) {
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      throw new Error("Project not found");
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return { message: "Project deleted successfully" };
  },
};
