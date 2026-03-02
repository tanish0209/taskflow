import { taskService } from "@/services/task.service";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: Promise<{ projectId: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { projectId } = await params;
    const tasks = await taskService.getTasksByProject(projectId);

    return NextResponse.json(
      { success: true, data: tasks },
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
