import { updateSubTaskSchema } from "@/schemas/subtask.schema";
import { subTaskService } from "@/services/subtask.service";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subtask = subTaskService.getSubtaskById(params.id);
    return NextResponse.json({ status: true, data: subtask }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Subtask not found" },
      { status: 404 }
    );
  }
}
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const ValidatedData = updateSubTaskSchema.parse(body);
    const subtask = await subTaskService.updateSubtask(
      params.id,
      ValidatedData
    );
    return NextResponse.json({ success: true, data: subtask }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      );
    }
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update subtask" },
      { status: 500 }
    );
  }
}
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await subTaskService.deleteSubtask(params.id);
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to delete subtask" },
      { status: 404 }
    );
  }
}
