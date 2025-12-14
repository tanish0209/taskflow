import { z } from "zod";
export const notificationTypeEnum = z.enum([
  "reminder",
  "mention",
  "status_update",
]);
export const createNotifiationSchema = z.object({
  type: notificationTypeEnum,
  message: z.string(),
  isRead: z.boolean().default(false),
  userId: z.cuid({ error: "Invalid User id" }),
});
export type createNotificationInput = z.infer<typeof createNotifiationSchema>;
