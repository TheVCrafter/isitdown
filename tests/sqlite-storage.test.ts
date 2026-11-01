import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { CheckResult } from "../src/check-result.js";
import { SqliteStorage } from "../src/sqlite-storage.js";

const url = "https://example.com/";

const responded: CheckResult = {
  outcome: "responded",
  url,
  checkedAt: "2026-11-01T12:00:00.000Z",
  status: "up",
  httpStatus: 200,
  responseTimeMS: 143,
};

const failed: CheckResult = {
  outcome: "failed",
  url,
  checkedAt: "2026-11-01T12:05:00.000Z",
  status: "down",
  error: "Timeout after 10000 ms",
};

describe("SqliteStorage", () => {
  let storage: SqliteStorage;

  beforeEach(() => {
    storage = new SqliteStorage(":memory:");
  });

  afterEach(() => {
    storage.close();
  });

  it("returns a saved responded result unchanged", async () => {
    await storage.save(responded);

    expect(await storage.getHistory(url)).toEqual([responded]);
  });

  it("returns a saved failed result unchanged", async () => {
    await storage.save(failed);

    expect(await storage.getHistory(url)).toEqual([failed]);
  });

  it("returns the history newest first", async () => {
    // failed is newer (12:05) than responded (12:00), but is saved first
    await storage.save(failed);
    await storage.save(responded);

    expect(await storage.getHistory(url)).toEqual([failed, responded]);
  });

  it("returns only the results of the requested URL", async () => {
    const otherUrl = "https://other.example/";
    await storage.save(responded);
    await storage.save({ ...responded, url: otherUrl });

    expect(await storage.getHistory(url)).toEqual([responded]);
  });

  it("returns an empty list for an unknown URL", async () => {
    expect(await storage.getHistory("https://unknown.example/")).toEqual([]);
  });

  it("keeps results after closing and reopening a file database", async () => {
    const dir = await mkdtemp(join(tmpdir(), "isitdown-"));
    const path = join(dir, "results.db");

    try {
      const first = new SqliteStorage(path);
      await first.save(responded);
      first.close();

      const second = new SqliteStorage(path);
      try {
        expect(await second.getHistory(url)).toEqual([responded]);
      } finally {
        second.close();
      }
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
