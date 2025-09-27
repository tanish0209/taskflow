import { subTaskService } from "@/services/subtask.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    const subtask = await subTaskService.getSubtasksByTaskId(taskId);
    return NextResponse.json({ success: true, data: subtask }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch subtasks" },
      { status: 404 }
    );
  }
}
