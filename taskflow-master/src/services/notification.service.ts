import { prisma } from "@/lib/prisma";
import { getIO } from "@/lib/socketServer";
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
    const notification = await prisma.notification.create({
      data: validatedData,
    });
    const io = getIO();
    const serializedNotification = {
      ...notification,
      createdAt: notification.createdAt.toISOString(),
    };
    io.to(`user_${validatedData.userId}`).emit(
      "notification-created",
      serializedNotification
    );
    return notification;
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
    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    const io = getIO();
    const serializedNotification = {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
    };
    io.to(`user_${notification.userId}`).emit(
      "notification-updated",
      serializedNotification
    );
    return updated;
  },

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    const io = getIO();
    io.to(`user_${userId}`).emit("notifications-all-read");

    return { message: "All notifications marked as read" };
  },

  async deleteNotification(notificationId: string) {
    const existing = await prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!existing) throw new Error("Notification not found");

    await prisma.notification.delete({
      where: { id: notificationId },
    });
    const io = getIO();
    io.to(`user_${existing.userId}`).emit("notification-deleted", {
      id: notificationId,
    });
    return { message: "Notification deleted successfully" };
  },
};
