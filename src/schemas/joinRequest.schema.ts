import { z } from "zod";

export const joinRequestStatusEnum = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const createJoinRequestSchema = z.object({
  userId: z.cuid("Invalid user ID"),
  projectId: z.cuid("Invalid project ID"),
});

export type CreateJoinRequestInput = z.infer<typeof createJoinRequestSchema>;

export const updateJoinRequestSchema = z.object({
  status: joinRequestStatusEnum,
});

export type UpdateJoinRequestInput = z.infer<typeof updateJoinRequestSchema>;
