import { prisma } from "@/lib/prisma";
import {
  createTaskInput,
  createTaskSchema,
  updateTaskInput,
  updateTaskSchema,
} from "@/schemas/task.schema";

export const taskService = {
  async createTask(data: createTaskInput) {
    const validatedData = createTaskSchema.parse(data);

    if (validatedData.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: validatedData.projectId },
      });
      if (!project) throw new Error("Project does not exist");
    }

    if (validatedData.assigneeId) {
      const user = await prisma.user.findUnique({
        where: { id: validatedData.assigneeId },
      });
      if (!user) throw new Error("Assignee does not exist");
    }

    if (validatedData.ownerId) {
      const user = await prisma.user.findUnique({
        where: { id: validatedData.ownerId },
      });
      if (!user) throw new Error("Owner does not exist");
    }

    return prisma.task.create({
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate
          ? new Date(validatedData.dueDate)
          : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        owner: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        subtasks: true,
        comments: { include: { author: true } },
        tags: true,
        attachments: true,
        activityLogs: true,
      },
    });
  },

  async getAllTasks() {
    return prisma.task.findMany({
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        owner: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        subtasks: true,
        comments: { include: { author: true } },
        tags: { include: { tag: true } },
        attachments: true,
        activityLogs: true,
      },
    });
  },

  async getTaskById(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        owner: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        subtasks: true,
        comments: { include: { author: true } },
        tags: { include: { tag: true } },
        attachments: true,
        activityLogs: true,
      },
    });

    if (!task) throw new Error("Task not found");
    return task;
  },

  async getTasksByUser(userId: string) {
    return prisma.task.findMany({
      where: { assigneeId: userId },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        owner: { select: { id: true, name: true, email: true } },
        subtasks: true,
        comments: { include: { author: true } },
        tags: { include: { tag: true } },
        attachments: true,
        activityLogs: true,
      },
    });
  },

  async getTasksByOwner(userId: string) {
    return prisma.task.findMany({
      where: { OR: [{ ownerId: userId }, { assigneeId: userId }] },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        owner: { select: { id: true, name: true, email: true } },
        subtasks: true,
        comments: { include: { author: true } },
        tags: { include: { tag: true } },
        attachments: true,
        activityLogs: true,
      },
    });
  },

  async getTasksByProject(projectId: string) {
    return prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        owner: { select: { id: true, name: true, email: true } },
        subtasks: true,
        comments: { include: { author: true } },
        tags: { include: { tag: true } },
        attachments: true,
        activityLogs: true,
      },
    });
  },

  async updateTask(id: string, data: updateTaskInput) {
    const validatedData = updateTaskSchema.parse(data);

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) throw new Error("Task does not exist");

    const updateData: any = {
      ...validatedData,
      dueDate: validatedData.dueDate
        ? new Date(validatedData.dueDate)
        : undefined,
    };

    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    return prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        owner: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        subtasks: true,
        comments: { include: { author: true } },
        tags: { include: { tag: true } },
        attachments: true,
        activityLogs: true,
      },
    });
  },

  async deleteTask(id: string) {
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) throw new Error("Task not found");

    await prisma.task.delete({ where: { id } });
    return { message: "Task deleted successfully" };
  },
};
