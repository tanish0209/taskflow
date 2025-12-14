import { NextResponse } from "next/server";
import { notificationService } from "@/services/notification.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    if (userId === "adminid")
      return NextResponse.json(
        { success: true, message: "No notifications" },
        { status: 200 }
      );
    const notifications = await notificationService.getNotificationsByUser(
      userId
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
