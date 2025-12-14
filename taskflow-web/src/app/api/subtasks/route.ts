import { requireRole } from "@/lib/auth";
import { createSubTaskSchema } from "@/schemas/subtask.schema";
import { subTaskService } from "@/services/subtask.service";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    await requireRole(["manager", "team_lead"]);
    const body = await req.json();
    const ValidatedData = createSubTaskSchema.parse(body);
    const subtask = await subTaskService.createSubTask(ValidatedData);
    return NextResponse.json({ success: true, data: subtask }, { status: 201 });
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
      { success: false, message: err.message || "Failed to create subtask" },
      { status: 500 }
    );
  }
}
