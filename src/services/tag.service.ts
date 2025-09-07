import { prisma } from "@/lib/prisma";
import {
  createTagInput,
  createTagSchema,
  updateTagInput,
  updateTagSchema,
} from "@/schemas/tag.schema";

export const tagService = {
  async createTag(data: createTagInput) {
    const ValidatedData = createTagSchema.parse(data);
    const exisitngTag = await prisma.tag.findUnique({
      where: { name: ValidatedData.name },
    });
    if (exisitngTag) throw new Error("Tag already exists");
    return prisma.tag.create({
      data: ValidatedData,
      select: {
        id: true,
        name: true,
      },
    });
  },
  async getTags() {
    return prisma.tags.findMany({
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
    const ValidatedData = await updateTagSchema.parse(data);
    const existingTag = await prisma.tag.findUnique({ where: { id } });
    if (!existingTag) throw new Error("Tag not found");
    if (ValidatedData.name) {
      const namecheck = await prisma.tag.findUnique({
        where: { name: ValidatedData.name },
      });
      if (namecheck && namecheck.id != id)
        throw new Error("Another tag with this name already exists");
    }
    return prisma.tag.update({
      where: { id },
      data: ValidatedData,
      select: { id: true, name: true },
    });
  },
  async deleteTag(id: string) {
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) throw new Error("Tag not found");

    await prisma.tag.delete({ where: { id } });
    return { message: "Tag deleted successfully" };
  },
};
