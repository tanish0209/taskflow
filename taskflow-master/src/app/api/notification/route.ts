import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/services/notification.service";
import {
  createNotifiationSchema,
  createNotificationInput,
} from "@/schemas/notification.schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData: createNotificationInput =
      createNotifiationSchema.parse(body);

    const notification = await notificationService.createNotification(
      validatedData
    );
    return NextResponse.json(
      { success: true, data: notification },
      { status: 201 }
    );
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 400 }
    );
  }
}
