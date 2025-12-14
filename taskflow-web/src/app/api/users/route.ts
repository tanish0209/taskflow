import { createUserSchema } from "@/schemas/user.schema";
import { userService } from "@/services/user.service";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createUserSchema.parse(body);
    const user = await userService.createUser(validatedData);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.log(error);
    if (error instanceof ZodError) {
      return NextResponse.json({ errors: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page")!, 10)
      : 1;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 10;
    const overview = searchParams.get("overview") === "true";

    const users = await userService.getUsers({page, limit,overview});
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
