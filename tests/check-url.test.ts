import { describe, expect, it } from "vitest";
import { checkUrl } from "../src/check-url.js";

const fixedNow = () => new Date("2026-11-01T12:00:00.000Z");

function fakeFetchWithStatus(status: number): typeof fetch {
  return async () => new Response(null, { status });
}

describe("checkUrl", () => {
  it.each([
    [200, "up"],
    [301, "up"],
    [404, "down"],
    [500, "down"],
  ] as const)("reports %i as %s", async (httpStatus, expectedStatus) => {
    const result = await checkUrl("https://example.com", {
      fetchFn: fakeFetchWithStatus(httpStatus),
      now: fixedNow,
    });

    expect(result).toMatchObject({
      outcome: "responded",
      url: "https://example.com",
      checkedAt: "2026-11-01T12:00:00.000Z",
      status: expectedStatus,
      httpStatus,
    });
  });

  it("reports failed and down for a network error", async () => {
    const failingFetch: typeof fetch = async () => {
      throw new Error("getaddrinfo ENOTFOUND example.com");
    };

    const result = await checkUrl("https://example.com", {
      fetchFn: failingFetch,
      now: fixedNow,
    });

    expect(result).toEqual({
      outcome: "failed",
      url: "https://example.com",
      checkedAt: "2026-11-01T12:00:00.000Z",
      status: "down",
      error: "getaddrinfo ENOTFOUND example.com",
    });
  });

  it("reports failed and down when the request times out", async () => {
    const hangingFetch: typeof fetch = (_input, init) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(init?.signal?.reason));
      });

    const result = await checkUrl("https://example.com", {
      fetchFn: hangingFetch,
      timeoutMs: 50,
      now: fixedNow,
    });

    expect(result).toMatchObject({
      outcome: "failed",
      status: "down",
      error: expect.any(String),
    });
  });
});
