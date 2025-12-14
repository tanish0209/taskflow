import { prisma } from "@/lib/prisma";
import { getIO } from "@/lib/socketServer";
import {
  createCommentInput,
  createCommentSchema,
  updateCommentInput,
  updateCommentSchema,
} from "@/schemas/comment.schema";
import { notificationService } from "./notification.service";

export const commentService = {
  async createComment(data: createCommentInput) {
    const ValidatedData = createCommentSchema.parse(data);
    const task = await prisma.task.findUnique({
      where: { id: ValidatedData.taskId },
    });
    if (!task) throw new Error("Task not found");
    const author = await prisma.user.findUnique({
      where: { id: ValidatedData.authorId },
    });
    if (!author) throw new Error("Author not found");

    const comment = await prisma.comment.create({
      data: ValidatedData,
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    });
    const mentionPattern = /@(\w+)/g;
    const mentions = [...ValidatedData.content.matchAll(mentionPattern)];

    if (mentions.length > 0) {
      for (const match of mentions) {
        const mentionedUsername = match[1];
        const mentionedUser = await prisma.user.findFirst({
          where: { name: { contains: mentionedUsername, mode: "insensitive" } },
        });

        if (mentionedUser && mentionedUser.id !== ValidatedData.authorId) {
          await notificationService.createNotification({
            type: "mention",
            message: `${author.name} mentioned you in a comment on "${task.title}"`,
            userId: mentionedUser.id,
            isRead: false,
          });
        }
      }
    } else {
      if (task.assigneeId && task.assigneeId !== ValidatedData.authorId) {
        await notificationService.createNotification({
          type: "status_update",
          message: `${author.name} commented on your task: "${task.title}"`,
          userId: task.assigneeId,
          isRead: false,
        });
      }

      if (
        task.ownerId &&
        task.ownerId !== ValidatedData.authorId &&
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

    const io = getIO();
    io.to(`task_${ValidatedData.taskId}`).emit(
      "comment-created",
      serializedComment
    );

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

    const commentupdate = await prisma.comment.update({
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
      ...commentupdate,
      createdAt: commentupdate.createdAt.toISOString(),
    };

    const io = getIO();
    io.to(`task_${existing.taskId}`).emit("comment-updated", serializedComment);

    return commentupdate;
  },

  async deleteComment(id: string) {
    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) throw new Error("Comment not found");

    await prisma.comment.delete({ where: { id } });

    const io = getIO();
    io.to(`task_${existing.taskId}`).emit("comment-deleted", { id });

    return "Comment deleted successfully";
  },
};
