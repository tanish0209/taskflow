import { updateSubTaskSchema } from "@/schemas/subtask.schema";
import { subTaskService } from "@/services/subtask.service";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const subtask = await subTaskService.getSubtaskById(id);
    return NextResponse.json({ success: true, data: subtask }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: (error as Error).message || "Subtask not found",
      },
      { status: 404 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const validatedData = updateSubTaskSchema.parse(body);
    const updatedSubtask = await subTaskService.updateSubtask(
      id,
      validatedData
    );
    return NextResponse.json(
      { success: true, data: updatedSubtask },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: (error as Error).message || "Failed to update subtask",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const result = await subTaskService.deleteSubtask(id);
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: (error as Error).message || "Failed to delete subtask",
      },
      { status: 404 }
    );
  }
}
