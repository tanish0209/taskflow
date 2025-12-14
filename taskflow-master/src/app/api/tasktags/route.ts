import { prisma } from "@/lib/prisma";
import { createTaskTagSchema } from "@/schemas/tasktag.schema";
import { taskTagService } from "@/services/taskTag.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ValidatedData = createTaskTagSchema.parse(body);
    const tasktag = await taskTagService.addTagToTask(ValidatedData);
    return NextResponse.json(tasktag);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
export async function DELETE(req: NextRequest) {
  try {
    const { taskId, tagId } = await req.json();
    if (!taskId || !tagId) {
      return NextResponse.json(
        { error: "taskId and tagId are required" },
        { status: 400 }
      );
    }
    await prisma.taskTag.delete({
      where: { taskId_tagId: { taskId, tagId } },
    });
    return NextResponse.json(
      { success: true, message: "Tag removed from Task Successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to remove tag from task" },
      { status: 500 }
    );
  }
}
