import pino from "pino";
import { activityLogService } from "@/services/activityLog.service";

const isDev = process.env.NODE_ENV !== "production";

const logger = pino(
  isDev
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
        },
        level: "debug",
      }
    : {
        level: "info", // NO transport in prod
      }
);

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
