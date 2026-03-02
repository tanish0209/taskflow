import { NextRequest, NextResponse } from "next/server";
import { createTaskSchema } from "@/schemas/task.schema";
import { taskService } from "@/services/task.service";
import { ZodError } from "zod";
import { getToken } from "next-auth/jwt";

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

export async function GET() {
  try {
    const tasks = await taskService.getAllTasks();

    return NextResponse.json(
      { success: true, data: tasks },
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
