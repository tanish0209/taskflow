import { NextRequest, NextResponse } from "next/server";
import { projectMemberService } from "@/services/projectMember.service";
import {
  updateProjectMemberSchema,
  UpdateProjectMemberInput,
} from "@/schemas/projectMember.schema";
import { requireRole } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; userId: string }> }
) {
  try {
    const { projectId, userId } = await params; // await the dynamic params
    const body = await req.json();
    const role = body.role || "MEMBER";

    const member = await projectMemberService.addMember({
      projectId,
      userId,
      role,
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Could not add member" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; userId: string }> }
) {
  try {
    await requireRole(["admin"]);
    const { projectId, userId } = await params; // await the dynamic params
    const body = await req.json();
    const validatedData: UpdateProjectMemberInput =
      updateProjectMemberSchema.parse(body);

    const updated = await projectMemberService.updateMemberRole(
      projectId,
      userId,
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
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; userId: string }> }
) {
  try {
    await requireRole(["admin"]);
    const { projectId, userId } = await params; // await the dynamic params
    const removed = await projectMemberService.removeMember(projectId, userId);
    return NextResponse.json({ success: true, data: removed }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 404 }
    );
  }
}
