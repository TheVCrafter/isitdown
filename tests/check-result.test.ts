import { describe, expect, it } from "vitest";
import { statusFromHttpCode } from "../src/check-result.js";

describe("statusFromHttpCode", () => {
  it("returns down for codes below 200", () => {
    expect(statusFromHttpCode(199)).toBe("down");
  });

  it("returns up for 200, the lowest success code", () => {
    expect(statusFromHttpCode(200)).toBe("up");
  });

  it("returns up for 399, the highest redirect code", () => {
    expect(statusFromHttpCode(399)).toBe("up");
  });

  it("returns down for 400, the lowest client error code", () => {
    expect(statusFromHttpCode(400)).toBe("down");
  });

  it("returns down for 599, the highest server error code", () => {
    expect(statusFromHttpCode(599)).toBe("down");
  });
});
