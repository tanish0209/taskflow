import { NextResponse } from "next/server";
import { attachmentService } from "@/services/attachment.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const attachments = await attachmentService.getAttachmentsByTask(taskId);
    const mappedAttachments = attachments.map((att) => ({
      id: att.id,
      url: att.fileUrl,
      filename: att.filename,
    }));
    return NextResponse.json(
      { success: true, data: mappedAttachments },
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
