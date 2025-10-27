import pino from "pino";
import { activityLogService } from "@/services/activityLog.service";

const logger = pino({
  transport: {
    target: "pino-pretty",
  },
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
});

export const logEvent = async (
  action: string,
  {
    userId,
    taskId,
    projectId,
    details,
  }: {
    userId?: string;
    taskId?: string;
    projectId?: string;
    details?: string;
  } = {}
) => {
  try {
    await activityLogService.createActivityLog({
      action,
      userId: userId || null,
      taskId: taskId || null,
      projectId: projectId || null,
      details: details ? JSON.stringify(details) : undefined,
    });

    logger.info(`Logged activity: ${action}`);
  } catch (error) {
    logger.error("Failed to save activity log:", error as any);
  }
};

export default logger;
