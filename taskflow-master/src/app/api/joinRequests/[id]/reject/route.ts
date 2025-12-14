import { NextResponse } from "next/server";
import { joinRequestService } from "@/services/joinRequest.service";
import { requireRole } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireRole(["admin", "manager"]);
    const request = await joinRequestService.rejectJoinRequest(id);
    return NextResponse.json({ success: true, data: request }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 400 }
    );
  }
}
