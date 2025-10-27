import { NextResponse } from "next/server";
import { activityLogService } from "@/services/activityLog.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const logs = await activityLogService.getLogsByTask(taskId);
    return NextResponse.json({ success: true, data: logs }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 404 }
    );
  }
}
