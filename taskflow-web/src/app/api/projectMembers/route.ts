import { NextRequest, NextResponse } from "next/server";
import { projectMemberService } from "@/services/projectMember.service";
import { createProjectMemberSchema } from "@/schemas/projectMember.schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createProjectMemberSchema.parse(body);

    const member = await projectMemberService.addMember(validatedData);
    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 400 }
    );
  }
}
