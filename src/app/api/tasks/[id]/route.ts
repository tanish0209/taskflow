import { prisma } from "@/lib/prisma";
import { updateTaskSchema } from "@/schemas/task.schema";
import { taskService } from "@/services/task.service";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        assignee: true,
        subtasks: true,
        comments: {
          include: {
            author: { select: { id: true, name: true } },
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        attachments: true,
        activityLogs: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    const taskWithTags = {
      ...task,
      tags: task.tags.map((t) => ({
        id: t.tag.id,
        name: t.tag.name,
      })),
    };

    return NextResponse.json({ success: true, data: taskWithTags });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const validatedData = updateTaskSchema.parse(body);
    const task = await taskService.updateTask(id, validatedData);
    return NextResponse.json({ success: true, data: task }, { status: 200 });
  } catch (error) {
    console.error(error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      );
    }
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update task" },
      { status: 500 }
    );
  }
}
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const result = await taskService.deleteTask(id);
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to delete task" },
      { status: 404 }
    );
  }
}
