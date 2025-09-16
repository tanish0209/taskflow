import { NextResponse } from "next/server";
import { notificationService } from "@/services/notification.service";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const notifications = await notificationService.getNotificationsByUser(
      params.userId
    );
    return NextResponse.json(
      { success: true, data: notifications },
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
