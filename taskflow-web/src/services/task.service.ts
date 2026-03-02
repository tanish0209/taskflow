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

// Full include for detail views (task detail page)
const fullTaskInclude = {
  assignee: { select: { id: true, name: true, email: true } },
  owner: { select: { id: true, name: true, email: true } },
  project: { select: { id: true, name: true } },
  subtasks: true,
  comments: { include: { author: true } },
  tags: { include: { tag: true } },
  attachments: true,
  activityLogs: true,
} as const;

// Lean select for list/dashboard views — only the fields the UI needs
const leanTaskSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  dueDate: true,
  startDate: true,
  assigneeId: true,
  ownerId: true,
  projectId: true,
  createdAt: true,
  updatedAt: true,
  assignee: { select: { id: true, name: true } },
  owner: { select: { id: true, name: true } },
  project: { select: { id: true, name: true } },
} as const;

export const taskService = {
  // ---------------- CREATE TASK ----------------
  async createTask(data: createTaskInput) {
    const validatedData = createTaskSchema.parse(data);

    // Validate all references in parallel instead of sequentially
    const [project, assignee, owner] = await Promise.all([
      validatedData.projectId
        ? prisma.project.findUnique({ where: { id: validatedData.projectId } })
        : null,
      validatedData.assigneeId
        ? prisma.user.findUnique({ where: { id: validatedData.assigneeId } })
        : null,
      validatedData.ownerId
        ? prisma.user.findUnique({ where: { id: validatedData.ownerId } })
        : null,
    ]);

    if (validatedData.projectId && !project)
      throw new Error("Project does not exist");
    if (validatedData.assigneeId && !assignee)
      throw new Error("Assignee does not exist");
    if (validatedData.ownerId && !owner)
      throw new Error("Owner does not exist");

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
      include: fullTaskInclude,
    });

    // Fire side-effects without blocking the response
    const sideEffects: Promise<unknown>[] = [];

    if (
      validatedData.assigneeId &&
      validatedData.assigneeId !== validatedData.ownerId
    ) {
      sideEffects.push(
        notificationService.createNotification({
          type: "status_update",
          message: `You have been assigned a new task: "${task.title}"`,
          userId: validatedData.assigneeId,
          isRead: false,
        })
      );
    }

    if (validatedData.projectId) {
      sideEffects.push(
        emitSocketEvent("task-created", {
          room: `project_${validatedData.projectId}`,
          data: task,
        })
      );
    }

    sideEffects.push(
      logEvent("Task Created", {
        userId: validatedData.ownerId,
        projectId: validatedData.projectId,
        taskId: task.id,
        details: `Task "${task.title}" created`,
      })
    );

    // Don't block the response — let side-effects complete in background
    Promise.allSettled(sideEffects).catch(console.error);

    return task;
  },

  // ---------------- GETTERS ----------------
  // List queries — lean select, only what dashboards need
  async getAllTasks() {
    return prisma.task.findMany({ select: leanTaskSelect });
  },

  // Detail query — full include for task detail page
  async getTaskById(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: fullTaskInclude,
    });
    if (!task) throw new Error("Task not found");
    return task;
  },

  async getTasksByUser(userId: string) {
    return prisma.task.findMany({
      where: { assigneeId: userId },
      select: leanTaskSelect,
    });
  },

  async getTasksByOwner(userId: string) {
    return prisma.task.findMany({
      where: { ownerId: userId },
      select: leanTaskSelect,
    });
  },

  async getTasksByProject(projectId: string) {
    return prisma.task.findMany({
      where: { projectId },
      select: leanTaskSelect,
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
      include: fullTaskInclude,
    });

    // Fire side-effects without blocking the response
    const sideEffects: Promise<unknown>[] = [
      emitSocketEvent("task-updated", {
        room: `task_${id}`,
        data: updatedTask,
      }),
      logEvent("Task Updated", {
        taskId: id,
        projectId: existingTask.projectId,
        details: `Task "${existingTask.title}" updated`,
      }),
    ];

    if (existingTask.projectId) {
      sideEffects.push(
        emitSocketEvent("task-updated", {
          room: `project_${existingTask.projectId}`,
          data: updatedTask,
        })
      );
    }

    Promise.allSettled(sideEffects).catch(console.error);

    return updatedTask;
  },

  // ---------------- DELETE TASK ----------------
  async deleteTask(id: string) {
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) throw new Error("Task not found");

    await prisma.task.delete({ where: { id } });

    // Fire side-effects without blocking the response
    const sideEffects: Promise<unknown>[] = [
      emitSocketEvent("task-deleted", { room: `task_${id}`, data: { id } }),
      logEvent("Task Deleted", {
        taskId: id,
        projectId: existingTask.projectId,
        details: `Task "${existingTask.title}" deleted`,
      }),
    ];

    if (
      existingTask.assigneeId &&
      existingTask.assigneeId !== existingTask.ownerId
    ) {
      sideEffects.push(
        notificationService.createNotification({
          type: "status_update",
          message: `Task "${existingTask.title}" has been deleted`,
          userId: existingTask.assigneeId,
          isRead: false,
        })
      );
    }

    if (existingTask.projectId) {
      sideEffects.push(
        emitSocketEvent("task-deleted", {
          room: `project_${existingTask.projectId}`,
          data: { id },
        })
      );
    }

    Promise.allSettled(sideEffects).catch(console.error);

    return { message: "Task deleted successfully" };
  },
};
