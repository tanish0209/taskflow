import { prisma } from "@/lib/prisma";
import { RegisterInput } from "@/schemas/auth.schema";
import bcrypt from "bcryptjs";

export const authService = {
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) throw new Error("Email already registered");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "employee", // always default
      },
      select: { id: true, name: true, email: true, role: true },
    });
  },
};
