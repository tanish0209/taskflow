import { requireRole } from "@/lib/auth";
import { createProjectSchema } from "@/schemas/project.schema";
import { ProjectService } from "@/services/project.service";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    await requireRole(["manager", "admin"]);
    const body = await req.json();
    const validatedData = createProjectSchema.parse(body);
    const project = await ProjectService.createProject(validatedData);
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error: unknown) {
    console.error(error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      );
    }
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to create project" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams) {
      const overview = searchParams.get("overview") === "true";
      const projects = await ProjectService.getAllProjects({ overview });
      return NextResponse.json(
        { success: true, data: projects },
        { status: 200 }
      );
    }
    const projects = await ProjectService.getAllProjects();
    return NextResponse.json(
      { success: true, data: projects },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      );
    }
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to get all projects" },
      { status: 500 }
    );
  }
}
