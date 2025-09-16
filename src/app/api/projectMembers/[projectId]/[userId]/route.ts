import { NextRequest, NextResponse } from "next/server";
import { projectMemberService } from "@/services/projectMember.service";
import {
  updateProjectMemberSchema,
  UpdateProjectMemberInput,
} from "@/schemas/projectMember.schema";
import { requireRole } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string; userId: string } }
) {
  try {
    await requireRole(["admin"]);
    const body = await req.json();
    const validatedData: UpdateProjectMemberInput =
      updateProjectMemberSchema.parse(body);

    const updated = await projectMemberService.updateMemberRole(
      params.projectId,
      params.userId,
      validatedData
    );
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { projectId: string; userId: string } }
) {
  try {
    await requireRole(["admin"]);
    const removed = await projectMemberService.removeMember(
      params.projectId,
      params.userId
    );
    return NextResponse.json({ success: true, data: removed }, { status: 200 });
  } catch (error) {
    const err = error as Error;

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 404 }
    );
  }
}
