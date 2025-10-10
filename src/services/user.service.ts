import {
  CreateUserInput,
  createUserSchema,
  UpdateUserInput,
  updateUserSchema,
} from "@/schemas/user.schema";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export const userService = {
  async createUser(data: CreateUserInput) {
    const validatedData = createUserSchema.parse(data);
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    return prisma.user.create({
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
  },

  async getUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        projects: { take: 3, select: { id: true, name: true, status: true } }, // only latest 3
      },
      orderBy: { createdAt: "desc" },
    });
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

    return prisma.user.update({
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
  },

  async deleteUser(id: string) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id } });
    if (user.role === "admin") throw new Error("Cannot delete Admin users");
    await prisma.user.delete({ where: { id } });
    return "User deleted successfully";
  },
};
