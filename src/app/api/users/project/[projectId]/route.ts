import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: { projectId: string };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const projectUsers = await prisma.user.findMany({
      where: {
        projects: { some: { id: params.projectId } },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        projects: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      { success: true, data: projectUsers },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(error);
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
