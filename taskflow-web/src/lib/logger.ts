import pino from "pino";
import { activityLogService } from "@/services/activityLog.service";

const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  base: undefined,
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
      userId: userId ?? null,
      taskId: taskId ?? null,
      projectId: projectId ?? null,
      details,
    });

    logger.info({ action, userId, taskId, projectId }, "Activity logged");
  } catch (error) {
    logger.error(error, "Failed to save activity log");
  }
};

export default logger;
