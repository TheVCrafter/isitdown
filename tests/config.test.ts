import { describe, expect, it } from "vitest";
import { readIntervalMs } from "../src/config.js";

describe("config", () => {
  it("returns 300000 when the value is undefined", () => {
    expect(readIntervalMs(undefined)).toBe(300000);
  });

  it("returns 300000 for an empty string", () => {
    expect(readIntervalMs("")).toBe(300000);
  });

  it("returns 300000 when only spaces are entered", () => {
    expect(readIntervalMs("    ")).toBe(300000);
  });

  it("converts a valid number of seconds to milliseconds", () => {
    expect(readIntervalMs("10")).toBe(10000);
  });

  it("throws error when 0 is entered", () => {
    expect(() => readIntervalMs("0")).toThrow();
  });

  it("throws error when a negative number is entered", () => {
    expect(() => readIntervalMs("-5")).toThrow();
  });

  it("throws error when a decimal number is entered", () => {
    expect(() => readIntervalMs("1.5")).toThrow();
  });

  it("throws error when alphabetic characters are entered", () => {
    expect(() => readIntervalMs("abc")).toThrow();
  });
});
