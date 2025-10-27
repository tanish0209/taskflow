import { NextRequest, NextResponse } from "next/server";
import { joinRequestService } from "@/services/joinRequest.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const requests = await joinRequestService.getJoinRequestsForUser(userId);
    return NextResponse.json(
      { success: true, data: requests },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
