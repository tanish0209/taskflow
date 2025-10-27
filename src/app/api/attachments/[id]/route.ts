import { NextRequest, NextResponse } from "next/server";
import {
  updateAttachmentSchema,
  updateAttachmentInput,
} from "@/schemas/attachment.schema";
import { attachmentService } from "@/services/attachment.service";
import cloudinary from "@/lib/cloudinary";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const attachment = await attachmentService.getAttachmentById(id);
    return NextResponse.json(
      { success: true, data: attachment },
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validatedData: updateAttachmentInput =
      updateAttachmentSchema.parse(body);

    const updated = await attachmentService.updateAttachment(id, validatedData);
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    const err = error as Error;

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const attachment = await attachmentService.getAttachmentById(id);
    const publicIdMatch = attachment.fileUrl.match(
      /\/upload\/(?:v\d+\/)?(.+)\.\w+$/
    );
    const publicId = publicIdMatch ? publicIdMatch[1] : null;

    if (publicId) {
      console.log("🗑️ Deleting Cloudinary file:", publicId);
      await cloudinary.uploader.destroy(publicId);
    }

    await attachmentService.deleteAttachment(id);

    return NextResponse.json(
      { success: true, message: "Attachment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    const err = error as Error;
    console.error("🚨 Delete error:", err.message);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 404 }
    );
  }
}
