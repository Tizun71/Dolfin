import winston from "winston";

// Winston logger for the AI workflow.
// Output format: [Date:Time] [Status] message, e.g. [2026-06-03:09:53:51] [START] ...
const lineFormat = winston.format.printf((info) => {
  const status = String(info.status ?? info.level).toUpperCase();
  return `[${info.timestamp}] [${status}] ${info.message}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD:HH:mm:ss" }),
    lineFormat,
  ),
  transports: [new winston.transports.Console()],
});

export function logStep(status: string, message: string): void {
  logger.info(message, { status });
}

// Wrap a node's execute so each run logs START, then DONE (with elapsed ms) or ERROR,
// keeping step logging in one place instead of in every node.
export function withStepLogging<S, R>(
  name: string,
  fn: (state: S) => Promise<R>,
): (state: S) => Promise<R> {
  return async (state: S): Promise<R> => {
    const startedAt = Date.now();
    logStep("START", `${name} started`);
    try {
      const result = await fn(state);
      logStep("DONE", `${name} done (${Date.now() - startedAt}ms)`);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logStep("ERROR", `${name} failed: ${message}`);
      throw error;
    }
  };
}
