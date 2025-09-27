import { taskService } from "@/services/task.service";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: { userId: string };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { userId } = params;
    const tasks = await taskService.getTasksByUser(userId);

    const mappedTasks = tasks.map((t) => ({
      ...t,
      project: t.project ? { id: t.project.id, name: t.project.name } : null,
    }));

    return NextResponse.json(
      { success: true, data: mappedTasks },
      { status: 200 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
