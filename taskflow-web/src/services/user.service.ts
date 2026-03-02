import {
  CreateUserInput,
  createUserSchema,
  UpdateUserInput,
  updateUserSchema,
} from "@/schemas/user.schema";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/logger";

export const userService = {
  async createUser(data: CreateUserInput) {
    const validatedData = createUserSchema.parse(data);
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    await logEvent("User Registered", { userId: user.id });
    return user;
  },

  async getUsers(
    queryParams: { page?: number; limit?: number; overview?: boolean } = {}
  ) {
    const { page = 1, limit = 10, overview = false } = queryParams;
    if (overview) {
      return prisma.user.findMany({
        take: 5,
        select: {
          id: true,
          name: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }
    const skip = (page - 1) * limit;
    const users = await prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        projects: { take: 3, select: { id: true, name: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    const total = await prisma.user.count();
    return { users, total };
  },

  async getUserById(id: string) {
    return prisma.user.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        projects: {
          take: 5,
          select: { id: true, name: true, status: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  },

  async updateUser(id: string, data: UpdateUserInput) {
    const validatedData = updateUserSchema.parse(data);
    if (validatedData.password)
      validatedData.password = await bcrypt.hash(validatedData.password, 10);
    const user = await prisma.user.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });
    await logEvent("User Updated", { userId: id });
    return user;
  },

  async deleteUser(id: string) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id } });
    if (user.role === "admin") throw new Error("Cannot delete Admin users");
    await prisma.user.delete({ where: { id } });
    await logEvent("User Deleted", { userId: id });
    return "User deleted successfully";
  },
};
