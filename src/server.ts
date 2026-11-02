import { createServer, type Server, type ServerResponse } from "node:http";
import { buildHistoryReport } from "./history.js";
import { HISTORY_PAGE } from "./page.js";
import { parsePeriod } from "./periods.js";
import type { ResultStorage } from "./storage.js";
import { validateUrl } from "./validate-url.js";

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

export function createHistoryServer(
  storage: ResultStorage,
  now: () => Date = () => new Date(),
): Server {
  return createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? "/", "http://localhost");

      if (request.method !== "GET") {
        sendJson(response, 405, { error: "Only GET is supported" });
        return;
      }

      if (requestUrl.pathname === "/") {
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        response.end(HISTORY_PAGE);
        return;
      }

      if (requestUrl.pathname !== "/api/history") {
        sendJson(response, 404, { error: "Not found" });
        return;
      }

      const validated = validateUrl(requestUrl.searchParams.get("url") ?? "");
      if (!validated.valid) {
        sendJson(response, 400, { error: validated.message });
        return;
      }

      const periodMs = parsePeriod(requestUrl.searchParams.get("period"));
      if (periodMs === null) {
        sendJson(response, 400, { error: "Unknown period, use 1h, 24h or 7d" });
        return;
      }

      const report = await buildHistoryReport(storage, validated.url, periodMs, now());
      sendJson(response, 200, report);
    } catch {
      sendJson(response, 500, { error: "Internal server error" });
    }
  });
}
