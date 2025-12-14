import { prisma } from "@/lib/prisma";
import {
  CreateActivityLogInput,
  createActivityLogSchema,
} from "@/schemas/activitylog.schema";

export const activityLogService = {
  async createActivityLog(data: CreateActivityLogInput) {
    const validatedData = createActivityLogSchema.parse(data);

    return prisma.activityLog.create({
      data: validatedData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } },
      },
    });
  },

  async getAllActivityLogs(page = 1, limit = 20) {
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.activityLog.count(),
    ]);

    return { logs, total };
  },

  async getLogsByUser(userId: string) {
    return prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        task: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } },
      },
    });
  },

  async getLogsByProject(projectId: string) {
    return prisma.activityLog.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    });
  },

  async getLogsByTask(taskId: string) {
    return prisma.activityLog.findMany({
      where: { taskId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });
  },
};
