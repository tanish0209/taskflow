import { NextResponse } from "next/server";
import { projectMemberService } from "@/services/projectMember.service";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const projects = await projectMemberService.getProjectsForUser(
      params.userId
    );
    return NextResponse.json(
      { success: true, data: projects },
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
