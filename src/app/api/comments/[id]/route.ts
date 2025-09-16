import { updateCommentSchema } from "@/schemas/comment.schema";
import { commentService } from "@/services/comment.service";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const comment = await commentService.getCommentById(params.id);
    return NextResponse.json({ success: true, data: comment }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
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
    const validatedData = updateCommentSchema.parse(body);
    const updatedcomment = await commentService.updateComment(
      params.id,
      validatedData
    );
    return NextResponse.json(
      { success: true, data: updatedcomment },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      );
    }
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update comment" },
      { status: 500 }
    );
  }
}
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const res = await commentService.deleteComment(params.id);
    return NextResponse.json(
      { success: true, message: "Comment Deleted", data: res },
      { status: 200 }
    );
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 404 }
    );
  }
}
