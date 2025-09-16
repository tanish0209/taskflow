import { createCommentSchema } from "@/schemas/comment.schema";
import { commentService } from "@/services/comment.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ValidatedData = createCommentSchema.parse(body);
    const comment = commentService.createComment(ValidatedData);
    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
