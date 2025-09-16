import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { registerSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);
    const user = await authService.register(validatedData);

    return NextResponse.json({ success: true, data: user }, { status: 201 });
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
      { success: false, message: err.message || "Failed to register user" },
      { status: 500 }
    );
  }
}
