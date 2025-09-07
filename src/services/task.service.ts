import { prisma } from "@/lib/prisma";
import {
  createTaskInput,
  createTaskSchema,
  updateTaskInput,
  updateTaskSchema,
} from "@/schemas/task.schema";

export const taskService = {
  async createTask(data: createTaskInput) {
    const ValidatedData = createTaskSchema.parse(data);
    if (ValidatedData.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: ValidatedData.projectId },
      });
      if (!project) throw new Error("Project does not exist");
    }
    if (ValidatedData.assigneeId) {
      const user = await prisma.user.findUnique({
        where: { id: ValidatedData.assigneeId },
      });
      if (!user) throw new Error("Asignee does not exist");
    }
    return prisma.task.create({
      data: {
        ...ValidatedData,
        dueDate: ValidatedData.dueDate
          ? new Date(ValidatedData.dueDate)
          : undefined,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        assigneeId: true,
        projectId: true,
      },
    });
  },

  async getAllTasks() {
    return prisma.task.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });
  },

  async getTaskById(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });
    if (!task) throw new Error("task not found");
    return task;
  },

  async updateTask(id: string, data: updateTaskInput) {
    const ValidatedData = updateTaskSchema.parse(data);
    const existingTask = await prisma.task.finUnique({ whre: { id } });
    if (!existingTask) throw new Error("Task does not exist");

    if (ValidatedData.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: ValidatedData.projectId },
      });
      if (!project) throw new Error("Project does not exist");
    }
    if (ValidatedData.assigneeId) {
      const user = await prisma.user.findUnique({
        where: { id: ValidatedData.assigneeId },
      });
      if (!user) throw new Error("Assignee user does not exist");
    }

    return prisma.task.update({
      where: { id },
      data: {
        ...ValidatedData,
        dueDate: ValidatedData.dueDate
          ? new Date(ValidatedData.dueDate)
          : undefined,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        updatedAt: true,
        assigneeId: true,
        projectId: true,
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
