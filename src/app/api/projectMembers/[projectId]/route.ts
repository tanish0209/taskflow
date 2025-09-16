import { NextResponse } from "next/server";
import { projectMemberService } from "@/services/projectMember.service";

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const members = await projectMemberService.getMembersByProject(
      params.projectId
    );
    return NextResponse.json({ success: true, data: members }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 404 }
    );
  }
}
