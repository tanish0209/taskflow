import { createJoinRequestSchema } from "@/schemas/joinRequest.schema";
import { joinRequestService } from "@/services/joinRequest.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ValidatedData = createJoinRequestSchema.parse(body);
    const joinrequest = await joinRequestService.createJoinRequest(
      ValidatedData
    );
    return NextResponse.json(
      { success: true, data: joinrequest },
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
export async function GET() {
  try {
    const requests = await joinRequestService.getAllJoinRequests();
    return NextResponse.json(
      { success: true, data: requests },
      { status: 200 }
    );
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 400 }
    );
  }
}
