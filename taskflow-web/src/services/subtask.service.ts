import { logEvent } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import {
  createSubTaskInput,
  createSubTaskSchema,
  updateSubTaskInput,
  updateSubTaskSchema,
} from "@/schemas/subtask.schema";
import { emitSocketEvent } from "@/lib/socketEmitter";

export const subTaskService = {
  async createSubTask(data: createSubTaskInput) {
    const validatedData = createSubTaskSchema.parse(data);

    const task = await prisma.task.findUnique({
      where: { id: validatedData.taskId },
    });
    if (!task) throw new Error("Parent task does not exist");

    const subTask = await prisma.subtask.create({
      data: validatedData,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        task: { select: { id: true, title: true } },
      },
    });

    // 🔔 Real-time update to task room
    await emitSocketEvent("subtask-created", {
      room: `task_${validatedData.taskId}`,
      data: subTask,
    });

    await logEvent("Subtask Created", {
      taskId: validatedData.taskId,
      details: `Subtask ${validatedData.title} created in Task ${subTask.task.title}`,
    });

    return subTask;
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
    const validatedData = updateSubTaskSchema.parse(data);

    const existingSubtask = await prisma.subtask.findUnique({
      where: { id },
    });
    if (!existingSubtask) throw new Error("Subtask does not exist");

    const updatedSubtask = await prisma.subtask.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
        task: { select: { id: true, title: true } },
      },
    });

    // 🔔 Real-time update to task room
    await emitSocketEvent("subtask-updated", {
      room: `task_${updatedSubtask.task.id}`,
      data: updatedSubtask,
    });

    await logEvent("Subtask Updated", {
      taskId: updatedSubtask.task.id,
      details: `Subtask ${updatedSubtask.title} updated in task ${updatedSubtask.task.title}`,
    });

    return updatedSubtask;
  },

  async deleteSubtask(id: string) {
    const subtask = await prisma.subtask.findUnique({ where: { id } });
    if (!subtask) throw new Error("Subtask does not exist");

    await prisma.subtask.delete({ where: { id } });

    // 🔔 Real-time update to task room
    await emitSocketEvent("subtask-deleted", {
      room: `task_${subtask.taskId}`,
      data: { id },
    });

    await logEvent("Subtask Deleted", {
      taskId: subtask.taskId,
      details: `Subtask ${subtask.title} deleted`,
    });

    return { message: "Subtask deleted successfully" };
  },
};
