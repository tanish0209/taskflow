import cloudinary from "@/lib/cloudinary";
import { createAttachmentSchema } from "@/schemas/attachment.schema";
import { attachmentService } from "@/services/attachment.service";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    // --- 1. Parse Form Data ---
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const taskId = formData.get("taskId")?.toString() || null;
    const projectId = formData.get("projectId")?.toString() || null;
    const filename =
      formData.get("filename")?.toString() || file.name || "unknown-file";
    const uploadedBy = formData.get("uploadedBy")?.toString() || null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    // --- 2. Convert File to Buffer ---
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // --- 3. Upload to Cloudinary ---
    console.log("📁 Uploading to Cloudinary...");
    const cloudResult: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "taskflow/attachments",
          public_id: uuidv4(),
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary Upload Error:", error.message);
            reject(error);
          } else {
            console.log("✅ Cloudinary Upload Successful:", result?.secure_url);
            resolve(result);
          }
        }
      );
      stream.end(buffer);
    });

    // --- 4. Validate & Save to DB ---
    const validatedData = createAttachmentSchema.parse({
      fileUrl: cloudResult.secure_url,
      fileType: file.type,
      filename,
      taskId,
      projectId,
      uploadedBy,
    });

    const attachment = await attachmentService.createAttachment(validatedData);
    const responseAttachment = {
      id: attachment.id,
      url: cloudResult.secure_url,
      filename: attachment.filename,
      fileType: attachment.fileType,
    };

    return NextResponse.json(
      { success: true, data: responseAttachment },
      { status: 201 }
    );
  } catch (error) {
    const err = error as Error;
    console.error("🚨 Attachment upload failed:", err.message);
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
