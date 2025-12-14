import { prisma } from "@/lib/prisma";
import {
  createTagInput,
  createTagSchema,
  updateTagInput,
  updateTagSchema,
} from "@/schemas/tag.schema";
import { emitSocketEvent } from "@/lib/socketEmitter";

export const tagService = {
  async createTag(data: createTagInput) {
    const validatedData = createTagSchema.parse(data);

    const existingTag = await prisma.tag.findUnique({
      where: { name: validatedData.name },
    });
    if (existingTag) throw new Error("Tag already exists");

    const tag = await prisma.tag.create({
      data: validatedData,
      select: {
        id: true,
        name: true,
      },
    });

    // 🔔 Global real-time update
    await emitSocketEvent("tag-created", {
      data: tag,
    });

    return tag;
  },

  async getTags() {
    return prisma.tag.findMany({
      select: {
        id: true,
        name: true,
        tasks: {
          include: {
            task: { select: { id: true, title: true, status: true } },
          },
        },
      },
    });
  },

  async getTagsById(id: string) {
    const tag = await prisma.tag.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        tasks: {
          include: {
            task: { select: { id: true, title: true, status: true } },
          },
        },
      },
    });
    if (!tag) throw new Error("Tag not found");
    return tag;
  },

  async updateTag(id: string, data: updateTagInput) {
    const validatedData = updateTagSchema.parse(data);

    const existingTag = await prisma.tag.findUnique({ where: { id } });
    if (!existingTag) throw new Error("Tag not found");

    if (validatedData.name) {
      const nameCheck = await prisma.tag.findUnique({
        where: { name: validatedData.name },
      });
      if (nameCheck && nameCheck.id !== id) {
        throw new Error("Another tag with this name already exists");
      }
    }

    const updatedTag = await prisma.tag.update({
      where: { id },
      data: validatedData,
      select: { id: true, name: true },
    });

    // 🔔 Global real-time update
    await emitSocketEvent("tag-updated", {
      data: updatedTag,
    });

    return updatedTag;
  },

  async deleteTag(id: string) {
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) throw new Error("Tag not found");

    await prisma.tag.delete({ where: { id } });

    // 🔔 Global real-time update
    await emitSocketEvent("tag-deleted", {
      data: { id },
    });

    return { message: "Tag deleted successfully" };
  },
};
