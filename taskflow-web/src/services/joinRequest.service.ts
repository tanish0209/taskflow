import { prisma } from "@/lib/prisma";
import {
  createJoinRequestSchema,
  CreateJoinRequestInput,
  updateJoinRequestSchema,
  UpdateJoinRequestInput,
} from "@/schemas/joinRequest.schema";
import { projectMemberService } from "./projectMember.service";
import { notificationService } from "./notification.service";
import { emitSocketEvent } from "@/lib/socketEmitter";

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
    if (existingRequest) {
      throw new Error("A pending request already exists.");
    }

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

    await emitSocketEvent("joinrequest-created", {
      room: `user_${project.ownerId}`,
      data: request,
    });

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

    const member = await projectMemberService.addMember({
      userId: request.userId,
      projectId: request.projectId,
      role: "MEMBER",
    });

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

    await emitSocketEvent("joinrequest-approved", {
      room: `user_${member.userId}`,
      data: updatedRequest,
    });

    await emitSocketEvent("project-member-added", {
      room: `project_${member.projectId}`,
      data: member,
    });

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

    await emitSocketEvent("joinrequest-rejected", {
      room: `user_${request.userId}`,
      data: updatedRequest,
    });

    return updatedRequest;
  },

  async getAllJoinRequests() {
    return prisma.joinRequest.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });
  },

  async getJoinRequestsForProject(projectId: string) {
    return prisma.joinRequest.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true } } },
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
