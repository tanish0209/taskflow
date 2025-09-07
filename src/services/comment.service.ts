import { prisma } from "@/lib/prisma";
import {
  createCommentInput,
  createCommentSchema,
  updateCommentInput,
  updateCommentSchema,
} from "@/schemas/comment.schema";

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
    return prisma.comment.create({
      data: ValidatedData,
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    });
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
        task: { select: { id: true, name: true } },
      },
    });
    if (!comment) throw new Error("Comment not found");
    return comment;
  },
  async updateComment(id: string, data: updateCommentInput) {
    const validatedData = updateCommentSchema.parse(data);

    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) throw new Error("Comment not found");

    return prisma.comment.update({
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
  },
  async deleteComment(id: string) {
    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) throw new Error("Comment not found");

    await prisma.comment.delete({ where: { id } });
    return "Comment deleted successfully";
  },
};
