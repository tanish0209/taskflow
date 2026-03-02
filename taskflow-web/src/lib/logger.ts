import pino from "pino";
import { activityLogService } from "@/services/activityLog.service";

const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  base: undefined,
});

export const logEvent = (
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
  // Fire-and-forget — return the promise but callers don't need to await it
  return activityLogService
    .createActivityLog({
      action,
      userId: userId ?? null,
      taskId: taskId ?? null,
      projectId: projectId ?? null,
      details,
    })
    .then(() => {
      logger.info({ action, userId, taskId, projectId }, "Activity logged");
    })
    .catch((error) => {
      logger.error(error, "Failed to save activity log");
    });
};

export default logger;
