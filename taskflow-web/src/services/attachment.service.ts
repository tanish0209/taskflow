import { prisma } from "@/lib/prisma";
import { emitSocketEvent } from "@/lib/socketEmitter";
import {
  createAttachmentInput,
  createAttachmentSchema,
  updateAttachmentInput,
  updateAttachmentSchema,
} from "@/schemas/attachment.schema";

export const attachmentService = {
  async createAttachment(data: createAttachmentInput) {
    const validatedData = createAttachmentSchema.parse(data);

    if (validatedData.taskId) {
      const task = await prisma.task.findUnique({
        where: { id: validatedData.taskId },
      });
      if (!task) throw new Error("Task not found");
    }

    if (validatedData.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: validatedData.projectId },
      });
      if (!project) throw new Error("Project not found");
    }

    if (validatedData.uploadedBy) {
      const user = await prisma.user.findUnique({
        where: { id: validatedData.uploadedBy },
      });
      if (!user) throw new Error("User who uploaded not found");
    }

    const attachment = await prisma.attachment.create({
      data: validatedData,
      include: {
        task: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // 🔔 Emit socket event (task room)
    if (validatedData.taskId) {
      await emitSocketEvent("attachment-created", {
        room: `task_${validatedData.taskId}`,
        data: attachment,
      });
    }

    return attachment;
  },

  async getAllAttachments() {
    return prisma.attachment.findMany({
      include: {
        task: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
    });
  },

  async getAttachmentsByTask(taskId: string) {
    return prisma.attachment.findMany({
      where: { taskId },
      include: { user: true },
    });
  },

  async getAttachmentById(id: string) {
    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: {
        task: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
    });

    if (!attachment) throw new Error("Attachment not found");
    return attachment;
  },

  async updateAttachment(id: string, data: updateAttachmentInput) {
    const validatedData = updateAttachmentSchema.parse(data);

    const existingAttachment = await prisma.attachment.findUnique({
      where: { id },
    });
    if (!existingAttachment) throw new Error("Attachment not found");

    const attachment = await prisma.attachment.update({
      where: { id },
      data: validatedData,
      include: {
        task: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
    });

    // 🔔 Emit socket event (user room)
    if (validatedData.uploadedBy) {
      await emitSocketEvent("attachment-updated", {
        room: `user_${validatedData.uploadedBy}`,
        data: attachment,
      });
    }

    return attachment;
  },

  async deleteAttachment(id: string) {
    const existingAttachment = await prisma.attachment.findUnique({
      where: { id },
    });
    if (!existingAttachment) throw new Error("Attachment not found");

    await prisma.attachment.delete({ where: { id } });

    // 🔔 Emit socket event (user room)
    if (existingAttachment.uploadedBy) {
      await emitSocketEvent("attachment-deleted", {
        room: `user_${existingAttachment.uploadedBy}`,
        data: { id },
      });
    }

    return { message: "Attachment deleted successfully" };
  },
};
