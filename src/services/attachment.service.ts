import { prisma } from "@/lib/prisma";
import {
  createAttachmentInput,
  createAttachmentSchema,
  updateAttachmentInput,
  updateAttachmentSchema,
} from "@/schemas/attachment.schema";

export const attachmentService = {
  async createAttachment(data: createAttachmentInput) {
    const ValidatedData = createAttachmentSchema.parse(data);
    if (ValidatedData.taskId) {
      const task = await prisma.task.findUnique({
        where: { id: ValidatedData.taskId },
      });
      if (!task) throw new Error("Task not found");
    }
    if (ValidatedData.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: ValidatedData.projectId },
      });
      if (!project) throw new Error("Project not found");
    }
    if (ValidatedData.uploadedBy) {
      const user = await prisma.user.findUnique({
        where: { id: ValidatedData.uploadedBy },
      });
      if (!user) throw new Error("User who uploaded not found");
    }
    return prisma.attachment.create({
      data: ValidatedData,
      inlcude: {
        task: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
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

    return prisma.attachment.update({
      where: { id },
      data: validatedData,
      include: {
        task: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
    });
  },
  async deleteAttachment(id: string) {
    const existingAttachment = await prisma.attachment.findUnique({
      where: { id },
    });
    if (!existingAttachment) throw new Error("Attachment not found");

    await prisma.attachment.delete({ where: { id } });
    return { message: "Attachment deleted successfully" };
  },
};
