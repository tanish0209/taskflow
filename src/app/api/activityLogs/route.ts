import { NextRequest, NextResponse } from "next/server";
import {
  CreateActivityLogInput,
  createActivityLogSchema,
} from "@/schemas/activitylog.schema";
import { activityLogService } from "@/services/activityLog.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData: CreateActivityLogInput =
      createActivityLogSchema.parse(body);

    const log = await activityLogService.createActivityLog(validatedData);
    return NextResponse.json({ success: true, data: log }, { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const logs = await activityLogService.getAllActivityLogs();
    return NextResponse.json({ success: true, data: logs }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
