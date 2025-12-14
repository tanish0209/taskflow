import { prisma } from "@/lib/prisma";
import {
  createJoinRequestSchema,
  CreateJoinRequestInput,
  updateJoinRequestSchema,
  UpdateJoinRequestInput,
} from "@/schemas/joinRequest.schema";
import { projectMemberService } from "./projectMember.service";
import { getIO } from "@/lib/socketServer";
import { notificationService } from "./notification.service";

export const joinRequestService = {
  async createJoinRequest(data: CreateJoinRequestInput) {
    const validatedData = createJoinRequestSchema.parse(data);

    const existingRequest = await prisma.joinRequest.findFirst({
      where: {
        userId: validatedData.userId,
        projectId: validatedData.projectId,
        status: "PENDING",
      },
    });
    if (existingRequest) throw new Error("A pending request already exists.");
    const project = await prisma.project.findUnique({
      where: { id: validatedData.projectId },
      select: { ownerId: true, name: true },
    });
    if (!project) throw new Error("Project not found");

    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      select: { name: true },
    });

    const request = await prisma.joinRequest.create({
      data: validatedData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });
    await notificationService.createNotification({
      type: "status_update",
      message: `${user?.name} has requested to join your project "${project.name}"`,
      userId: project.ownerId,
      isRead: false,
    });

    const io = getIO();
    io.to(`user_${project?.ownerId}`).emit("joinrequest-created", request);

    return request;
  },

  async approveJoinRequest(requestId: string) {
    const request = await prisma.joinRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new Error("Join request not found");

    if (request.status !== "PENDING") {
      throw new Error("This request has already been processed");
    }

    // Add to ProjectMember
    const member = await projectMemberService.addMember({
      userId: request.userId,
      projectId: request.projectId,
      role: "MEMBER", // default
    });

    // Update request status
    const updatedRequest = await prisma.joinRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" },
    });

    const project = await prisma.project.findUnique({
      where: { id: request.projectId },
      select: { name: true },
    });
    if (!project) throw new Error("Project not found");
    await notificationService.createNotification({
      type: "status_update",
      message: `Your request to join project "${project.name}" has been approved!`,
      userId: request.userId,
      isRead: false,
    });
    // Emit events
    const io = getIO();
    io.to(`user_${member.userId}`).emit("joinrequest-approved", updatedRequest);
    io.to(`project_${member.projectId}`).emit("project-member-added", member);

    return updatedRequest;
  },

  async rejectJoinRequest(requestId: string) {
    const request = await prisma.joinRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new Error("Join request not found");

    const updatedRequest = await prisma.joinRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });
    await notificationService.createNotification({
      type: "status_update",
      message: `Your request to join project "${updatedRequest.project.name}" has been declined`,
      userId: request.userId,
      isRead: false,
    });

    const io = getIO();
    io.to(request.userId).emit("joinrequest-rejected", updatedRequest);

    return updatedRequest;
  },

  async getAllJoinRequests() {
    return prisma.joinRequest.findMany({
      include: {
        user: true,
        project: true,
      },
    });
  },

  async getJoinRequestsForProject(projectId: string) {
    return prisma.joinRequest.findMany({
      where: { projectId },
      include: { user: true },
    });
  },
  async getJoinRequestsForUser(userId: string) {
    return prisma.joinRequest.findMany({
      where: { userId },
      include: { project: true },
      orderBy: { createdAt: "desc" },
    });
  },
};
