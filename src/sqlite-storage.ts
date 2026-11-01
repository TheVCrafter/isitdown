import { DatabaseSync } from "node:sqlite";
import type { CheckResult, CheckStatus } from "./check-result.js";
import type { ResultStorage } from "./storage.js";

export class SqliteStorage implements ResultStorage {
  private readonly db: DatabaseSync;

  constructor(path: string) {
    this.db = new DatabaseSync(path);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS check_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        checked_at TEXT NOT NULL,
        outcome TEXT NOT NULL,
        status TEXT NOT NULL,
        http_status INTEGER,
        response_time_ms INTEGER,
        error TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_results_url_time ON check_results (url, checked_at);
    `);
  }

  async save(result: CheckResult): Promise<void> {
    const insert = this.db.prepare(
      `INSERT INTO check_results
       (url, checked_at, outcome, status, http_status, response_time_ms, error)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );

    if (result.outcome === "responded") {
      insert.run(
        result.url,
        result.checkedAt,
        result.outcome,
        result.status,
        result.httpStatus,
        result.responseTimeMS,
        null,
      );
      return;
    }

    insert.run(
      result.url,
      result.checkedAt,
      result.outcome,
      result.status,
      null,
      null,
      result.error,
    );
    return;
  }

  async getHistory(url: string): Promise<readonly CheckResult[]> {
    const rows = this.db
      .prepare(
        `SELECT url, checked_at, outcome, status, http_status, response_time_ms, error
      FROM check_results
      WHERE url = ?
      ORDER BY checked_at DESC, id DESC`,
      )
      .all(url);

    return rows.map((row) => toCheckResult(row));
  }

  close(): void {
    this.db.close();
  }
}

function toCheckResult(row: Record<string, unknown>): CheckResult {
  const outcome = readString(row, "outcome");
  if (outcome === "responded") {
    return {
      outcome: "responded",
      url: readString(row, "url"),
      checkedAt: readString(row, "checked_at"),
      status: readStatus(row, "status"),
      httpStatus: readNumber(row, "http_status"),
      responseTimeMS: readNumber(row, "response_time_ms"),
    };
  }

  if (outcome === "failed") {
    return {
      outcome: "failed",
      url: readString(row, "url"),
      checkedAt: readString(row, "checked_at"),
      status: "down",
      error: readString(row, "error"),
    };
  }

  throw new Error(`Unknown outcome "${outcome}" in stored result`);
}

function readString(row: Record<string, unknown>, column: string): string {
  const value = row[column];
  if (typeof value !== "string") {
    throw new Error(`Expected column "${column}" to be a string, got ${typeof value}`);
  }
  return value;
}

function readNumber(row: Record<string, unknown>, column: string): number {
  const value = row[column];
  if (typeof value !== "number") {
    throw new Error(`Expected column "${column}" to be a number, got ${typeof value}`);
  }
  return value;
}

function readStatus(row: Record<string, unknown>, column: string): CheckStatus {
  const value = row[column];
  if (value !== "up" && value !== "down") {
    throw new Error(`Expected column "${column}" to be "up" or "down"`);
  }
  return value;
}
