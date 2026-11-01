import { describe, expect, it } from "vitest";
import { formatResult } from "../src/format-result.js";
import type { CheckResult } from "../src/check-result.js";

describe("formatResult", () => {
  it("shows the HTTP code and response time for a responded check", () => {
    const result: CheckResult = {
      outcome: "responded",
      url: "https://example.com/",
      checkedAt: "2026-11-01T12:00:00.000Z",
      status: "up",
      httpStatus: 200,
      responseTimeMS: 143,
    };

    const line = formatResult(result);

    expect(line).toContain("UP");
    expect(line).toContain("https://example.com/");
    expect(line).toContain("HTTP 200");
    expect(line).toContain("143 ms");
  });

  it("shows error text and status for a failed check", () => {
    const result: CheckResult = {
      outcome: "failed",
      url: "https://example.com/",
      checkedAt: "2026-11-01T12:00:00.000Z",
      status: "down",
      error: "getaddrinfo ENOTFOUND example.com",
    };

    const line = formatResult(result);

    expect(line).toContain("DOWN");
    expect(line).toContain("https://example.com/");
    expect(line).toContain("getaddrinfo ENOTFOUND example.com");
  });
});
