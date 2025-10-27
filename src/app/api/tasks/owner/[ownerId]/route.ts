import { taskService } from "@/services/task.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ownerId: string }> }
) {
  try {
    const { ownerId } = await params;
    const tasks = await taskService.getTasksByOwner(ownerId);
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
