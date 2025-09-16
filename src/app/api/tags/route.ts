import { createTagSchema } from "@/schemas/tag.schema";
import { tagService } from "@/services/tag.service";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createTagSchema.parse(body);
    const tag = await tagService.createTag(validatedData);
    return NextResponse.json({ success: true, data: tag }, { status: 201 });
  } catch (error: unknown) {
    console.log(error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      );
    }
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
export async function GET() {
  try {
    const tags = await tagService.getTags();
    return NextResponse.json({ success: true, data: tags }, { status: 200 });
  } catch (error) {
    console.error(error);
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
