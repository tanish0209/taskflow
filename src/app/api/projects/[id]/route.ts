import { updateProjectSchema } from "@/schemas/project.schema";
import { ProjectService } from "@/services/project.service";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await ProjectService.getProjectById(params.id);
    return NextResponse.json({ success: true, data: project }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);

    console.error(error);
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Project not found" },
      { status: 404 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validatedData = updateProjectSchema.parse(body);
    const project = await ProjectService.updateProject(
      validatedData,
      params.id
    );
    return NextResponse.json({ success: true, data: project }, { status: 200 });
  } catch (error) {
    console.error(error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      );
    }
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to update the project",
      },
      { status: 500 }
    );
  }
}
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const message = await ProjectService.deleteProject(params.id);

    return NextResponse.json({ success: true, message }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to delete project" },
      { status: 500 }
    );
  }
}
