import { describe, expect, it } from "vitest";
import { validateUrl } from "../src/validate-url.js";

describe("accepts an http URL and normalizes it	", () => {
  it("valid http:// URL", () => {
    expect(validateUrl("http://example.com")).toEqual({
      valid: true,
      url: "http://example.com/",
    });
  });

  it("accepts an https URL and normalizes it", () => {
    expect(validateUrl("https://example.com")).toEqual({
      valid: true,
      url: "https://example.com/",
    });
  });

  it("trims spaces around a valid URL", () => {
    expect(validateUrl("  https://example.com  ")).toEqual({
      valid: true,
      url: "https://example.com/",
    });
  });

  it("rejects an empty string", () => {
    expect(validateUrl("")).toEqual({
      valid: false,
      message: "Enter a URL",
    });
  });

  it("rejects a string with only spaces", () => {
    expect(validateUrl("   ")).toEqual({
      valid: false,
      message: "Enter a URL",
    });
  });

  it("rejects a URL without a protocol", () => {
    expect(validateUrl("example.com")).toEqual({
      valid: false,
      message: "This is not a valid URL",
    });
  });

  it("rejects a URL with an unsupported protocol", () => {
    expect(validateUrl("ftp://example.com")).toEqual({
      valid: false,
      message: "Only http and https URLs are supported",
    });
  });

  it("rejects a malformed URL", () => {
    expect(validateUrl("http://")).toEqual({
      valid: false,
      message: "This is not a valid URL",
    });
  });
});
