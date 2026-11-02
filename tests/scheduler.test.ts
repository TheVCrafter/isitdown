import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CheckResult } from "../src/check-result.js";
import { runChecks, startScheduler } from "../src/scheduler.js";
import type { ResultStorage } from "../src/storage.js";

class MemoryStorage implements ResultStorage {
  readonly saved: CheckResult[] = [];

  async save(result: CheckResult): Promise<void> {
    this.saved.push(result);
  }

  async getHistory(url: string): Promise<readonly CheckResult[]> {
    return this.saved.filter((result) => result.url === url);
  }
}

async function fakeCheck(url: string): Promise<CheckResult> {
  return {
    outcome: "responded",
    url,
    checkedAt: "2026-11-01T12:00:00.000Z",
    status: "up",
    httpStatus: 200,
    responseTimeMS: 100,
  };
}

describe("runChecks", () => {
  it("saves a result for every URL", async () => {
    const storage = new MemoryStorage();

    await runChecks({
      urls: ["https://a.example/", "https://b.example/"],
      intervalMs: 1000,
      storage,
      check: fakeCheck,
    });

    expect(storage.saved.map((result) => result.url)).toEqual([
      "https://a.example/",
      "https://b.example/",
    ]);
  });

  it("reports a failing check and still checks the other URLs", async () => {
    const storage = new MemoryStorage();
    const onError = vi.fn();

    await runChecks({
      urls: ["https://a.example/", "https://broken.example/", "https://b.example/"],
      intervalMs: 1000,
      storage,
      check: async (url) => {
        if (url === "https://broken.example/") {
          throw new Error("boom");
        }
        return fakeCheck(url);
      },
      onError,
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(storage.saved.map((result) => result.url)).toEqual([
      "https://a.example/",
      "https://b.example/",
    ]);
  });

  it("reports a failing save", async () => {
    const onError = vi.fn();
    const failingStorage: ResultStorage = {
      save: async () => {
        throw new Error("disk full");
      },
      getHistory: async () => [],
    };

    await runChecks({
      urls: ["https://a.example/"],
      intervalMs: 1000,
      storage: failingStorage,
      check: fakeCheck,
      onError,
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(new Error("disk full"));
  });
});

describe("startScheduler", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("runs a round immediately", async () => {
    const storage = new MemoryStorage();
    const stop = startScheduler({
      urls: ["https://a.example/"],
      intervalMs: 1000,
      storage,
      check: fakeCheck,
    });

    await vi.advanceTimersByTimeAsync(0);

    expect(storage.saved).toHaveLength(1);
    stop();
  });

  it("runs again after one interval", async () => {
    const storage = new MemoryStorage();
    const stop = startScheduler({
      urls: ["https://a.example/"],
      intervalMs: 1000,
      storage,
      check: fakeCheck,
    });

    await vi.advanceTimersByTimeAsync(0);
    expect(storage.saved).toHaveLength(1);

    await vi.advanceTimersByTimeAsync(1000);
    expect(storage.saved).toHaveLength(2);

    stop();
  });

  it("stops after the stop function is called", async () => {
    const storage = new MemoryStorage();
    const stop = startScheduler({
      urls: ["https://a.example/"],
      intervalMs: 1000,
      storage,
      check: fakeCheck,
    });

    await vi.advanceTimersByTimeAsync(0);
    expect(storage.saved).toHaveLength(1);
    stop();
    await vi.advanceTimersByTimeAsync(5000);
    expect(storage.saved).toHaveLength(1);
  });

  it("skips a tick while the previous round is still running", async () => {
    const slowCheck = vi.fn(async (url: string) => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return fakeCheck(url);
    });

    const stop = startScheduler({
      urls: ["https://a.example/"],
      intervalMs: 1000,
      storage: new MemoryStorage(),
      check: slowCheck,
    });

    await vi.advanceTimersByTimeAsync(3000);
    expect(slowCheck).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(3000);
    expect(slowCheck).toHaveBeenCalledTimes(2);

    stop();
  });
});
