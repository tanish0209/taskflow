import { userService } from "@/services/user.service";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await userService.getUserById(params.id);
    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error: unknown) {
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
        message: err.message || "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
  } catch (error) {}
}
