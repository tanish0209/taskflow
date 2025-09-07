import { prisma } from "@/lib/prisma";
import {
  createNotifiationSchema,
  createNotificationInput,
} from "@/schemas/notification.schema";

export const notificationService = {
  async createNotification(data: createNotificationInput) {
    const validatedData = createNotifiationSchema.parse(data);

    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    });
    if (!user) throw new Error("User not found");

    return prisma.notification.create({
      data: validatedData,
    });
  },

  async getNotificationsByUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async markAsRead(notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification) throw new Error("Notification not found");

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  },
  async deleteNotification(notificationId: string) {
    const existing = await prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!existing) throw new Error("Notification not found");

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return { message: "Notification deleted successfully" };
  },
};
