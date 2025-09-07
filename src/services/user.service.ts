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
    const ValidatedData = createUserSchema.parse(data);
    const existingUser = await prisma.user.findUnique({
      where: { email: ValidatedData.email },
    });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }
    const hashedPassword = await bcrypt.hash(ValidatedData.password, 10);
    return prisma.user.create({
      data: {
        ...ValidatedData,
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

  async getUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  },

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) throw new Error("User not found");
    return user;
  },

  async updateUser(id: string, data: UpdateUserInput) {
    const ValidatedData = updateUserSchema.parse(data);
    const updateData = { ...ValidatedData };
    if (ValidatedData.password) {
      updateData.password = await bcrypt.hash(ValidatedData.password, 10);
    }
    return prisma.user.update({
      where: { id },
      data: updateData,
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
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("User not found");
    if (user.role === "admin") {
      throw new Error("Cannot delete Admin users");
    }
    await prisma.user.delete({
      where: { id },
    });
    return "User Deleted Successfully";
  },
};
