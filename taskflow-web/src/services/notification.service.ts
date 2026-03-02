import { prisma } from "@/lib/prisma";
import { emitSocketEvent } from "@/lib/socketEmitter";
import {
  createNotifiationSchema,
  createNotificationInput,
} from "@/schemas/notification.schema";

export const notificationService = {
  async createNotification(data: createNotificationInput) {
    const validatedData = createNotifiationSchema.parse(data);

    // Removed redundant user lookup — FK constraint handles invalid userId
    const notification = await prisma.notification.create({
      data: validatedData,
    });

    const serializedNotification = {
      ...notification,
      createdAt: notification.createdAt.toISOString(),
    };

    // Fire-and-forget — don't block on socket emit
    emitSocketEvent("notification-created", {
      room: `user_${validatedData.userId}`,
      data: serializedNotification,
    }).catch(console.error);

    return notification;
  },

  async getNotificationsByUser(userId: string) {
    // Removed redundant user lookup — if userId is invalid, findMany returns []
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

    await emitSocketEvent("notification-updated", {
      room: `user_${notification.userId}`,
      data: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
      },
    });

    return updated;
  },

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    await emitSocketEvent("notifications-all-read", {
      room: `user_${userId}`,
      data: {},
    });

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

    await emitSocketEvent("notification-deleted", {
      room: `user_${existing.userId}`,
      data: { id: notificationId },
    });

    return { message: "Notification deleted successfully" };
  },
};
