import { taskService } from "@/services/task.service";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: { projectId: string };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { projectId } = params;
    const tasks = await taskService.getTasksByProject(projectId);
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
