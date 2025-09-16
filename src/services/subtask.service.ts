import { prisma } from "@/lib/prisma";
import {
  createSubTaskInput,
  createSubTaskSchema,
  updateSubTaskInput,
  updateSubTaskSchema,
} from "@/schemas/subtask.schema";

export const subTaskService = {
  async createSubTask(data: createSubTaskInput) {
    const ValidatedData = createSubTaskSchema.parse(data);

    const task = await prisma.task.findUnique({
      where: { id: ValidatedData.taskId },
    });
    if (!task) throw new Error("Parent task does not exist");

    return prisma.subtask.create({
      data: ValidatedData,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        task: { select: { id: true, title: true } },
      },
    });
  },

  async getSubtasksByTaskId(taskId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new Error("Parent task does not exist");

    return prisma.subtask.findMany({
      where: { taskId },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        task: { select: { id: true, title: true } },
      },
    });
  },

  async getSubtaskById(id: string) {
    const subtask = await prisma.subtask.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        task: { select: { id: true, title: true } },
      },
    });
    if (!subtask) throw new Error("Subtask does not exist");
    return subtask;
  },

  async updateSubtask(id: string, data: updateSubTaskInput) {
    const ValidatedData = updateSubTaskSchema.parse(data);

    const existingSubtask = await prisma.subtask.findUnique({ where: { id } });
    if (!existingSubtask) throw new Error("Subtask does not exist");

    return prisma.subtask.update({
      where: { id },
      data: ValidatedData,
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
        task: { select: { id: true, title: true } },
      },
    });
  },

  async deleteSubtask(id: string) {
    const subtask = await prisma.subtask.findUnique({ where: { id } });
    if (!subtask) throw new Error("Subtask does not exist");

    await prisma.subtask.delete({ where: { id } });
    return { message: "Subtask deleted successfully" };
  },
};
