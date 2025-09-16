import { NextResponse } from "next/server";
import { commentService } from "@/services/comment.service";

export async function GET(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const comments = await commentService.getCommentsByTask(params.taskId);

    return NextResponse.json(
      { success: true, data: comments },
      { status: 200 }
    );
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
