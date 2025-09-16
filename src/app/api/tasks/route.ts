import { requireRole } from "@/lib/auth";
import { createTaskSchema } from "@/schemas/task.schema";
import { taskService } from "@/services/task.service";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    await requireRole(["manager", "team_lead"]);
    const body = await req.json();
    const validatedData = createTaskSchema.parse(body);
    const task = taskService.createTask(validatedData);
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
export async function GET() {
  try {
    const tasks = await taskService.getAllTasks();

    return NextResponse.json({ success: true, data: tasks }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
