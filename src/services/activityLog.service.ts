import { prisma } from "@/lib/prisma";
import {
  CreateActivityLogInput,
  createActivityLogSchema,
} from "@/schemas/activitylog.schema";

export const activityLogService = {
  async createActivityLog(data: CreateActivityLogInput) {
    const ValidatedData = createActivityLogSchema.parse(data);
    return prisma.activitylog.create({
      data: ValidatedData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } },
      },
    });
  },
  async getAllActivityLogs() {
    return prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } },
      },
    });
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
