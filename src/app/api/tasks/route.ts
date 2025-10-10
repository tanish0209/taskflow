// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { ZodError } from "zod";
import { createTaskSchema } from "@/schemas/task.schema";
import { taskService } from "@/services/task.service";

// POST /api/tasks
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.role) throw new Error("Unauthorized");
    if (!["manager", "team_lead"].includes(token.role))
      throw new Error("Forbidden");

    const body = await req.json();
    const validatedData = createTaskSchema.parse(body);

    const task = await taskService.createTask(validatedData);

    return NextResponse.json({ success: true, data: task }, { status: 201 });
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
      { success: false, message: err.message || "Failed to create task" },
      { status: 500 }
    );
  }
}

// GET /api/tasks
export async function GET(req: NextRequest) {
  try {
    const tasks = await taskService.getAllTasks();
    const mappedTasks = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      priority: t.priority,
      status: t.status,
      project: t.project ? { id: t.project.id, name: t.project.name } : null,
      owner: t.owner
        ? { id: t.owner.id, name: t.owner.name, email: t.owner.email }
        : null,
      assignee: t.assignee
        ? { id: t.assignee.id, name: t.assignee.name, email: t.assignee.email }
        : null,
      dueDate: t.dueDate?.toISOString() || null,
      startDate: t.startDate?.toISOString() || null,
      completedAt: t.completedAt?.toISOString() || null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));

    return NextResponse.json(
      { success: true, data: mappedTasks },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(error);
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
