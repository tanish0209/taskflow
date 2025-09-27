import { z } from "zod";
export const RoleEnum = z.enum(["employee", "manager", "team_lead", "admin"]);

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: RoleEnum.optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
