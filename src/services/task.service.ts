import { prisma } from "@/lib/prisma";
import {
  createTaskInput,
  createTaskSchema,
  updateTaskInput,
  updateTaskSchema,
} from "@/schemas/task.schema";
import { getIO } from "@/lib/socketServer";
import { notificationService } from "./notification.service";
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
    const task = await prisma.task.create({
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
    if (
      validatedData.assigneeId &&
      validatedData.assigneeId !== validatedData.ownerId
    ) {
      await notificationService.createNotification({
        type: "status_update",
        message: `You have been assigned a new task:"${task.title}"`,
        userId: validatedData.assigneeId,
        isRead: false,
      });
    }
    if (validatedData.projectId) {
      const io = getIO();
      io.to(`project_${validatedData.projectId}`).emit("task-created", task);
    }
    return task;
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
      where: { OR: [{ ownerId: userId }] },
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
    const updatedTask = await prisma.task.update({
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
    if (validatedData.status && validatedData.status !== existingTask.status) {
      if (
        existingTask.ownerId &&
        existingTask.ownerId !== existingTask.assigneeId
      ) {
        await notificationService.createNotification({
          type: "status_update",
          message: `Task "${updatedTask.title}" status changed to ${validatedData.status}`,
          userId: existingTask.ownerId,
          isRead: false,
        });
      }
      if (validatedData.status === "done" && existingTask.assigneeId) {
        await notificationService.createNotification({
          type: "status_update",
          message: `Great job! Task "${updatedTask.title}" has been marked as complete`,
          userId: existingTask.assigneeId,
          isRead: false,
        });
      }
    }
    if (
      validatedData.assigneeId &&
      validatedData.assigneeId !== existingTask.assigneeId
    ) {
      await notificationService.createNotification({
        type: "status_update",
        message: `You have been assigned to task: "${updatedTask.title}"`,
        userId: validatedData.assigneeId,
        isRead: false,
      });

      if (existingTask.assigneeId) {
        await notificationService.createNotification({
          type: "status_update",
          message: `You have been unassigned from task: "${updatedTask.title}"`,
          userId: existingTask.assigneeId,
          isRead: false,
        });
      }
    }
    const io = getIO();
    io.to(`task_${id}`).emit("task-updated", updatedTask);
    if (validatedData.projectId) {
      io.to(`project_${validatedData.projectId}`).emit(
        "task-updated",
        updatedTask
      );
    }
    return updatedTask;
  },

  async deleteTask(id: string) {
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) throw new Error("Task not found");

    await prisma.task.delete({ where: { id } });
    if (
      existingTask.assigneeId &&
      existingTask.assigneeId !== existingTask.ownerId
    ) {
      await notificationService.createNotification({
        type: "status_update",
        message: `Task "${existingTask.title}" has been deleted`,
        userId: existingTask.assigneeId,
        isRead: false,
      });
    }
    const io = getIO();
    io.to(`task_${id}`).emit("task-deleted", { id });
    if (existingTask.projectId) {
      io.to(`project_${existingTask.projectId}`).emit("task-deleted", { id });
    }
    return { message: "Task deleted successfully" };
  },
};
