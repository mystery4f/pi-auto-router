import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

const DEFAULT_LOG_DIR = path.join(os.homedir(), ".pi", "agent", "extensions");

function resolveLogDir(): string {
	if (process.env.AUTO_ROUTER_LOG_DIR) return process.env.AUTO_ROUTER_LOG_DIR;
	try {
		const routesPath = path.join(os.homedir(), ".pi", "agent", "extensions", "auto-router.routes.json");
		const routes = JSON.parse(fs.readFileSync(routesPath, "utf-8"));
		if (routes.logDir && typeof routes.logDir === "string") return routes.logDir;
	} catch { /* ignore */ }
	return DEFAULT_LOG_DIR;
}

const DEFAULT_EVENTS_PATH = path.join(resolveLogDir(), "auto-router.events.jsonl");

type RouterEventEnvelope<T = Record<string, unknown>> = {
  type: string;
  timestamp: string;
  requestId: string;
  conversationId: string;
  routeId: string;
  version: 1;
  data: T;
};

export class RouterEventLogger {
  constructor(private readonly filePath = DEFAULT_EVENTS_PATH) {}

  log<T extends Record<string, unknown>>(event: RouterEventEnvelope<T>): void {
    try {
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      fs.appendFileSync(this.filePath, JSON.stringify(event) + "\n");
    } catch {
      // best-effort
    }
  }

  clear(): void {
    try {
      fs.writeFileSync(this.filePath, "");
    } catch {
      // best-effort
    }
  }

  get logFilePath(): string {
    return this.filePath;
  }
}

export type { RouterEventEnvelope };
