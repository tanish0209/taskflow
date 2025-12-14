import { prisma } from "@/lib/prisma";
import {
  createTaskTagInput,
  createTaskTagSchema,
} from "@/schemas/tasktag.schema";

export const taskTagService = {
  async addTagToTask(data: createTaskTagInput) {
    const ValidatedData = createTaskTagSchema.parse(data);
    const task = await prisma.task.findUnique({
      where: { id: ValidatedData.taskId },
    });
    if (!task) throw new Error("Task not found");
    const tag = await prisma.tag.findUnique({
      where: { id: ValidatedData.tagId },
    });
    if (!tag) throw new Error("Tag not found");

    const existing = await prisma.taskTag.findUnique({
      where: {
        taskId_tagId: {
          taskId: ValidatedData.taskId,
          tagId: ValidatedData.tagId,
        },
      },
    });
    if (existing) throw new Error("Tag already assigned to this task");
    return prisma.taskTag.create({
      data: ValidatedData,
    });
  },
  async removeTagFromTask(data: createTaskTagInput) {
    const ValidatedData = createTaskTagSchema.parse(data);
    const existing = await prisma.taskTag.findUnique({
      where: {
        taskId_tagId: {
          taskId: ValidatedData.taskId,
          tagId: ValidatedData.tagId,
        },
      },
    });
    if (!existing) throw new Error("This tag is not attached to the task");

    await prisma.taskTag.delete({
      where: {
        taskId_tagId: {
          taskId: ValidatedData.taskId,
          tagId: ValidatedData.tagId,
        },
      },
    });
    return { message: "Tag Removed from Task" };
  },
  async getTagsForTask(taskId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new Error("Task not found");

    return prisma.taskTag.findMany({
      where: { taskId },
      include: { tag: true },
    });
  },
  async getTasksForTag(tagId: string) {
    const tag = await prisma.tag.findUnique({ where: { id: tagId } });
    if (!tag) throw new Error("Tag not found");

    return prisma.taskTag.findMany({
      where: { tagId },
      include: { task: true },
    });
  },
};
