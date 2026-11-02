import { describe, expect, it } from "vitest";
import { readIntervalMs, readPort } from "../src/config.js";

describe("readIntervalMs", () => {
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

describe("readPort", () => {
  it("returns 3000 when the value is undefined", () => {
    expect(readPort(undefined)).toBe(3000);
  });

  it("returns 3000 for an empty string", () => {
    expect(readPort("")).toBe(3000);
  });

  it("returns 3000 when only spaces are entered", () => {
    expect(readPort("   ")).toBe(3000);
  });

  it("returns the port for a valid number", () => {
    expect(readPort("8080")).toBe(8080);
  });

  it("accepts the lowest port, 1", () => {
    expect(readPort("1")).toBe(1);
  });

  it("accepts the highest port, 65535", () => {
    expect(readPort("65535")).toBe(65535);
  });

  it("throws for 0", () => {
    expect(() => readPort("0")).toThrow();
  });

  it("throws for a port above 65535", () => {
    expect(() => readPort("65536")).toThrow();
  });

  it("throws for a negative number", () => {
    expect(() => readPort("-5")).toThrow();
  });

  it("throws for a decimal number", () => {
    expect(() => readPort("1.5")).toThrow();
  });

  it("throws for text", () => {
    expect(() => readPort("abc")).toThrow();
  });
});
