import { prisma } from "@/lib/prisma";
import {
  createJoinRequestSchema,
  CreateJoinRequestInput,
  updateJoinRequestSchema,
  UpdateJoinRequestInput,
} from "@/schemas/joinRequest.schema";
import { projectMemberService } from "./projectMember.service";

export const joinRequestService = {
  // Create a new join request
  async createJoinRequest(data: CreateJoinRequestInput) {
    const validatedData = createJoinRequestSchema.parse(data);

    // Ensure request not already made
    const existingRequest = await prisma.joinRequest.findFirst({
      where: {
        userId: validatedData.userId,
        projectId: validatedData.projectId,
        status: "PENDING",
      },
    });
    if (existingRequest) throw new Error("A pending request already exists.");

    return prisma.joinRequest.create({
      data: validatedData,
    });
  },

  // Approve a join request → adds user to project members
  async approveJoinRequest(requestId: string) {
    const request = await prisma.joinRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new Error("Join request not found");

    if (request.status !== "PENDING") {
      throw new Error("This request has already been processed");
    }

    // Add to ProjectMember
    await projectMemberService.addMember({
      userId: request.userId,
      projectId: request.projectId,
      role: "MEMBER", // default
    });

    // Update request status
    return prisma.joinRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" },
    });
  },

  // Reject a join request
  async rejectJoinRequest(requestId: string) {
    const request = await prisma.joinRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new Error("Join request not found");

    return prisma.joinRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
    });
  },

  // Get all join requests for a project
  async getJoinRequestsForProject(projectId: string) {
    return prisma.joinRequest.findMany({
      where: { projectId },
      include: { user: true },
    });
  },
};
