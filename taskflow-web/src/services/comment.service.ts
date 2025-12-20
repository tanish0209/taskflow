import { prisma } from "@/lib/prisma";
import { emitSocketEvent } from "@/lib/socketEmitter";
import {
  createCommentInput,
  createCommentSchema,
  updateCommentInput,
  updateCommentSchema,
} from "@/schemas/comment.schema";
import { notificationService } from "./notification.service";

export const commentService = {
  async createComment(data: createCommentInput) {
    const validatedData = createCommentSchema.parse(data);

    const task = await prisma.task.findUnique({
      where: { id: validatedData.taskId },
    });
    if (!task) throw new Error("Task not found");

    const author = await prisma.user.findUnique({
      where: { id: validatedData.authorId },
    });
    if (!author) throw new Error("Author not found");

    const comment = await prisma.comment.create({
      data: validatedData,
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    });

    const mentionPattern = /@(\w+)/g;
    const mentions = [...validatedData.content.matchAll(mentionPattern)];

    if (mentions.length > 0) {
      for (const match of mentions) {
        const mentionedUsername = match[1];
        const mentionedUser = await prisma.user.findFirst({
          where: {
            name: { contains: mentionedUsername, mode: "insensitive" },
          },
        });

        if (mentionedUser && mentionedUser.id !== validatedData.authorId) {
          await notificationService.createNotification({
            type: "mention",
            message: `${author.name} mentioned you in a comment on "${task.title}"`,
            userId: mentionedUser.id,
            isRead: false,
          });
        }
      }
    } else {
      if (task.assigneeId && task.assigneeId !== validatedData.authorId) {
        await notificationService.createNotification({
          type: "status_update",
          message: `${author.name} commented on your task: "${task.title}"`,
          userId: task.assigneeId,
          isRead: false,
        });
      }

      if (
        task.ownerId &&
        task.ownerId !== validatedData.authorId &&
        task.ownerId !== task.assigneeId
      ) {
        await notificationService.createNotification({
          type: "status_update",
          message: `${author.name} commented on task: "${task.title}"`,
          userId: task.ownerId,
          isRead: false,
        });
      }
    }

    const serializedComment = {
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    };

    await emitSocketEvent("comment-created", {
      room: `task_${validatedData.taskId}`,
      data: serializedComment,
    });

    return comment;
  },

  async getCommentsByTask(taskId: string) {
    return prisma.comment.findMany({
      where: { taskId },
      include: {
        author: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getCommentById(id: string) {
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    });
    if (!comment) throw new Error("Comment not found");
    return comment;
  },

  async updateComment(id: string, data: updateCommentInput) {
    const validatedData = updateCommentSchema.parse(data);

    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) throw new Error("Comment not found");

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    });

    const serializedComment = {
      ...updatedComment,
      createdAt: updatedComment.createdAt.toISOString(),
    };

    await emitSocketEvent("comment-updated", {
      room: `task_${existing.taskId}`,
      data: serializedComment,
    });

    return updatedComment;
  },

  async deleteComment(id: string) {
    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) throw new Error("Comment not found");

    await prisma.comment.delete({ where: { id } });

    await emitSocketEvent("comment-deleted", {
      room: `task_${existing.taskId}`,
      data: { id },
    });

    return "Comment deleted successfully";
  },
};
