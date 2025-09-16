import { NextResponse } from "next/server";
import { notificationService } from "@/services/notification.service";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updated = await notificationService.markAsRead(params.id);
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 400 }
    );
  }
}
