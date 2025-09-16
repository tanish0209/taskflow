import { updateUserSchema } from "@/schemas/user.schema";
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
    const body = await req.json();
    const validatedData = updateUserSchema.parse(body);
    const updatedUser = await userService.updateUser(params.id, validatedData);
    return NextResponse.json(
      { sucess: true, data: updatedUser },
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
      {
        success: false,
        message: err.message || "An unexpected error occurred.",
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
    const message = await userService.deleteUser(params.id);
    return NextResponse.json({ success: true, message }, { status: 200 });
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
      {
        success: false,
        message: err.message || "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
