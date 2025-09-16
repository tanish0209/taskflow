import { NextResponse } from "next/server";
import { attachmentService } from "@/services/attachment.service";

export async function GET(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const attachments = await attachmentService.getAttachmentsByTask(
      params.taskId
    );
    return NextResponse.json(
      { success: true, data: attachments },
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
