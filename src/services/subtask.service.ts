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
    if (!task) throw new Error("Task does not exist");

    return prisma.subtask.create({
      data: ValidatedData,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        taskId: true,
      },
    });
  },
  async getSubtasksbyTaskId(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!task) throw new Error("Task not found");
    return prisma.subtask.findMany({
      where: { taskId },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
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
        taskId: true,
      },
    });
    if (!subtask) throw new Error("Subtask not found");
    return subtask;
  },
  async updateSubtask(id: string, data: updateSubTaskInput) {
    const validatedData = updateSubTaskSchema.parse(data);

    const existingSubtask = await prisma.subtask.findUnique({ where: { id } });
    if (!existingSubtask) throw new Error("Subtask not found");

    return prisma.subtask.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    });
  },
  async deleteSubtask(id: string) {
    const subtask = await prisma.subtask.findUnique({ where: { id } });
    if (!subtask) throw new Error("Subtask not found");

    await prisma.subtask.delete({ where: { id } });
    return { message: "Subtask deleted successfully" };
  },
};
