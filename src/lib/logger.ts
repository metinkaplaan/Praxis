type Level = "info" | "warn" | "error";

function log(level: Level, message: string, extra?: Record<string, unknown>) {
  const line = {
    ts: new Date().toISOString(),
    level,
    message,
    ...extra,
  };
  const out = JSON.stringify(line);
  if (level === "error") console.error(out);
  else console.log(out);
}

export const logger = {
  info: (message: string, extra?: Record<string, unknown>) => log("info", message, extra),
  warn: (message: string, extra?: Record<string, unknown>) => log("warn", message, extra),
  error: (message: string, extra?: Record<string, unknown>) => log("error", message, extra),
};
