import { describe, expect, it } from "vitest";
import { parsePeriod } from "../src/periods.js";

describe("parsePeriod", () => {
  it("returns 3600000 for 1h", () => {
    expect(parsePeriod("1h")).toBe(3600000);
  });

  it("returns 86400000 for 24h", () => {
    expect(parsePeriod("24h")).toBe(86400000);
  });

  it("returns 604800000 for 7d", () => {
    expect(parsePeriod("7d")).toBe(604800000);
  });

  it("returns 86400000 for null (default)", () => {
    expect(parsePeriod(null)).toBe(86400000);
  });

  it("returns null for unknown period", () => {
    expect(parsePeriod("abc")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parsePeriod("")).toBeNull();
  });

  it("returns null for constructor", () => {
    expect(parsePeriod("constructor")).toBeNull();
  });
});
