import { z } from "zod";
export const createAttachmentSchema = z.object({
  fileUrl: z.url({ error: "Invalid file URL" }),
  fileType: z.string().optional(),
  taskId: z.cuid({ error: "Invalid task Id" }).optional().nullable(),
  projectId: z.cuid({ error: "Invalid Project Id" }).optional().nullable(),
  uploadedBy: z.cuid({ error: "Invalid User id" }).optional().nullable(),
});
export type createAttachmentInput = z.infer<typeof createAttachmentSchema>;
export const updateAttachmentSchema = z.object({
  fileUrl: z.url().optional(),
  fileType: z.string().optional(),
  taskId: z.cuid().optional().nullable(),
  projectId: z.cuid().optional().nullable(),
  uploadedBy: z.cuid().optional().nullable(),
});
export type updateAttachmentInput = z.infer<typeof updateAttachmentSchema>;
