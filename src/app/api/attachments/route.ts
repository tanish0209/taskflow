import { createAttachmentSchema } from "@/schemas/attachment.schema";
import { attachmentService } from "@/services/attachment.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createAttachmentSchema.parse(body);
    const attachment = await attachmentService.createAttachment(validatedData);
    return NextResponse.json(
      { success: true, data: attachment },
      { status: 201 }
    );
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
export async function GET() {
  try {
    const attachments = await attachmentService.getAllAttachments();
    return NextResponse.json(
      { success: true, data: attachments },
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
