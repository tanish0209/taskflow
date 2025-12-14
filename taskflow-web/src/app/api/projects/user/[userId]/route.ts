import { ProjectService } from "@/services/project.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const projects = await ProjectService.getProjectsByUser(userId);
    return NextResponse.json(
      { success: true, data: projects },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(error);
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
