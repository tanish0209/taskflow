import { NextRequest, NextResponse } from "next/server";
import { activityLogService } from "@/services/activityLog.service";
import { createActivityLogSchema } from "@/schemas/activitylog.schema";
import { requireRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createActivityLogSchema.parse(body);

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

export async function GET(req: NextRequest) {
  try {
    await requireRole(["admin"]);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const { logs, total } = await activityLogService.getAllActivityLogs(
      page,
      limit
    );

    return NextResponse.json({
      success: true,
      data: logs,
      total,
      page,
      limit,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
