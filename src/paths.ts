import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

/**
 * Expand a leading `~` (or `~\` / `~/`) to the user's home directory.
 * Works cross-platform — Windows included.
 *
 * - `"~\\logs\\foo"` → `"C:\\Users\\you\\logs\\foo"`
 * - `"~/logs/foo"`   → `"/home/you/logs/foo"`
 * - `"C:\\abs"`      → unchanged
 */
export function expandTilde(p: string): string {
	if (p === "~") return os.homedir();
	if (p.startsWith("~\\") || p.startsWith("~/")) {
		return path.join(os.homedir(), p.slice(2));
	}
	return p;
}

const DEFAULT_LOG_DIR = path.join(os.homedir(), ".pi", "agent", "extensions");

/**
 * Resolve the log directory from:
 * 1. AUTO_ROUTER_LOG_DIR env var
 * 2. routes.json `logDir` field
 * 3. default: ~/.pi/agent/extensions
 *
 * Handles `~` expansion for the env var and config values.
 */
export function resolveLogDir(): string {
	if (process.env.AUTO_ROUTER_LOG_DIR) {
		return expandTilde(process.env.AUTO_ROUTER_LOG_DIR);
	}
	try {
		const routesPath = path.join(os.homedir(), ".pi", "agent", "extensions", "auto-router.routes.json");
		const routes = JSON.parse(fs.readFileSync(routesPath, "utf-8"));
		if (routes.logDir && typeof routes.logDir === "string") {
			return expandTilde(routes.logDir);
		}
	} catch { /* ignore */ }
	return DEFAULT_LOG_DIR;
}
