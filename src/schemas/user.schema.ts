import {z} from "zod";
export const RoleEnum=z.enum(['employee','manager','team_lead','admin'])
export const createUserSchema=z.object({
    name:z.string().min(2, { error: "Name must be at least 2 characters long" }).max(50,{error:"Name is too long"}),
    email:z.email({error:"Invalid email address"}),
    password:z.string().min(6,{error:"Password must be atleast 6 characters long"}).max(40,{error:"Password too long"}),
    role:RoleEnum.default('employee')
})
export const updateUserSchema=z.object({
    name: z.string().min(2).max(50).optional(),
    email: z.email().optional(),
    password: z.string().min(6).max(40).optional(),
    role: RoleEnum.optional(),
})

export type CreateUserInput=z.infer<typeof createUserSchema>
export type UpdateUserInput=z.infer<typeof updateUserSchema>
export type UserRole=z.infer<typeof RoleEnum>