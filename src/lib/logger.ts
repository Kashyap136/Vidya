type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const CURRENT_LEVEL: LogLevel =
  process.env.NODE_ENV === "production" ? "info" : "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  userId?: string;
  duration?: number;
  error?: unknown;
  [key: string]: unknown;
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LEVEL];
}

function formatLog(entry: LogEntry): string {
  return JSON.stringify(entry);
}

export const logger = {
  debug(message: string, meta?: Partial<LogEntry>): void {
    if (!shouldLog("debug")) return;
    console.debug(
      formatLog({ timestamp: new Date().toISOString(), level: "debug", message, ...meta })
    );
  },

  info(message: string, meta?: Partial<LogEntry>): void {
    if (!shouldLog("info")) return;
    console.info(
      formatLog({ timestamp: new Date().toISOString(), level: "info", message, ...meta })
    );
  },

  warn(message: string, meta?: Partial<LogEntry>): void {
    if (!shouldLog("warn")) return;
    console.warn(
      formatLog({ timestamp: new Date().toISOString(), level: "warn", message, ...meta })
    );
  },

  error(message: string, meta?: Partial<LogEntry>): void {
    if (!shouldLog("error")) return;
    console.error(
      formatLog({ timestamp: new Date().toISOString(), level: "error", message, ...meta })
    );
  },
};
