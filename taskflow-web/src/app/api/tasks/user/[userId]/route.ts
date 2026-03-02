import { taskService } from "@/services/task.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const tasks = await taskService.getTasksByUser(userId);

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
