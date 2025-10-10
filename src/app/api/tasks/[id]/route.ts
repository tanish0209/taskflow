// src/app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { updateTaskSchema } from "@/schemas/task.schema";
import { taskService } from "@/services/task.service";

// GET /api/tasks/:id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const task = await taskService.getTaskById(id);

    // Serialize dates to ISO strings
    const mappedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      project: task.project
        ? { id: task.project.id, name: task.project.name }
        : null,
      owner: task.owner
        ? { id: task.owner.id, name: task.owner.name, email: task.owner.email }
        : null,
      assignee: task.assignee
        ? {
            id: task.assignee.id,
            name: task.assignee.name,
            email: task.assignee.email,
          }
        : null,
      dueDate: task.dueDate?.toISOString() || null,
      startDate: task.startDate?.toISOString() || null,
      completedAt: task.completedAt?.toISOString() || null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      comments: task.comments.map((c) => ({
        id: c.id,
        content: c.content,
        author: c.author ? { id: c.author.id, name: c.author.name } : null,
        createdAt: c.createdAt.toISOString(),
      })),
      subtasks: task.subtasks,
      tags: task.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
    };

    return NextResponse.json(
      { success: true, data: mappedTask },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(error);
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/:id
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const validatedData = updateTaskSchema.parse(body);

    const task = await taskService.updateTask(id, validatedData);

    // Serialize dates
    const mappedTask = {
      ...task,
      dueDate: task.dueDate?.toISOString() || null,
      startDate: task.startDate?.toISOString() || null,
      completedAt: task.completedAt?.toISOString() || null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };

    return NextResponse.json(
      { success: true, data: mappedTask },
      { status: 200 }
    );
  } catch (error) {
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

// DELETE /api/tasks/:id
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
      { status: 500 }
    );
  }
}
