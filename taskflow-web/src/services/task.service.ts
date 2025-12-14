import { prisma } from "@/lib/prisma";
import {
  createTaskInput,
  createTaskSchema,
  updateTaskInput,
  updateTaskSchema,
} from "@/schemas/task.schema";
import { notificationService } from "./notification.service";
import { logEvent } from "@/lib/logger";
import { emitSocketEvent } from "@/lib/socketEmitter";

export const taskService = {
  // ---------------- CREATE TASK ----------------
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

    const dataToCreate: any = {
      title: validatedData.title,
      priority: validatedData.priority,
      status: validatedData.status,
      ownerId: validatedData.ownerId,
      projectId: validatedData.projectId,
    };

    if (validatedData.assigneeId)
      dataToCreate.assigneeId = validatedData.assigneeId;
    if (validatedData.dueDate)
      dataToCreate.dueDate = new Date(validatedData.dueDate);
    if (validatedData.description)
      dataToCreate.description = validatedData.description;
    if (validatedData.startDate)
      dataToCreate.startDate = validatedData.startDate;
    if (validatedData.completedAt)
      dataToCreate.completedAt = validatedData.completedAt;

    const task = await prisma.task.create({
      data: dataToCreate,
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
        message: `You have been assigned a new task: "${task.title}"`,
        userId: validatedData.assigneeId,
        isRead: false,
      });
    }

    // 🔔 Real-time events
    if (validatedData.projectId) {
      await emitSocketEvent("task-created", {
        room: `project_${validatedData.projectId}`,
        data: task,
      });
    }

    await logEvent("Task Created", {
      userId: validatedData.ownerId,
      projectId: validatedData.projectId,
      taskId: task.id,
      details: `Task "${task.title}" created`,
    });

    return task;
  },

  // ---------------- GETTERS ----------------
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
      where: { ownerId: userId },
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

  // ---------------- UPDATE TASK ----------------
  async updateTask(id: string, data: updateTaskInput) {
    const validatedData = updateTaskSchema.parse(data);

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) throw new Error("Task does not exist");

    const updateData: any = { ...validatedData };
    if (validatedData.dueDate)
      updateData.dueDate = new Date(validatedData.dueDate);
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

    // 🔔 Real-time updates
    await emitSocketEvent("task-updated", {
      room: `task_${id}`,
      data: updatedTask,
    });

    if (existingTask.projectId) {
      await emitSocketEvent("task-updated", {
        room: `project_${existingTask.projectId}`,
        data: updatedTask,
      });
    }

    await logEvent("Task Updated", {
      taskId: id,
      projectId: existingTask.projectId,
      details: `Task "${existingTask.title}" updated`,
    });

    return updatedTask;
  },

  // ---------------- DELETE TASK ----------------
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

    // 🔔 Real-time updates
    await emitSocketEvent("task-deleted", {
      room: `task_${id}`,
      data: { id },
    });

    if (existingTask.projectId) {
      await emitSocketEvent("task-deleted", {
        room: `project_${existingTask.projectId}`,
        data: { id },
      });
    }

    await logEvent("Task Deleted", {
      taskId: id,
      projectId: existingTask.projectId,
      details: `Task "${existingTask.title}" deleted`,
    });

    return { message: "Task deleted successfully" };
  },
};
