import { NextResponse } from "next/server";
import { notificationService } from "@/services/notification.service";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await notificationService.deleteNotification(id);
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 404 }
    );
  }
}
