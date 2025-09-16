import { NextResponse } from "next/server";
import { notificationService } from "@/services/notification.service";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await notificationService.deleteNotification(params.id);
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 404 }
    );
  }
}
