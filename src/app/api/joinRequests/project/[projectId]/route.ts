import { NextResponse } from "next/server";
import { joinRequestService } from "@/services/joinRequest.service";

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const requests = await joinRequestService.getJoinRequestsForProject(
      params.projectId
    );
    return NextResponse.json(
      { success: true, data: requests },
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
