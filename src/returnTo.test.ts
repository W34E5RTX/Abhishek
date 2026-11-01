import { describe, expect, it } from "vitest";
import { safeReturnTo } from "./returnTo";

describe("safe return paths", () => {
  it("preserves an internal booking route and its query", () => {
    expect(safeReturnTo("/book/frontend-development?source=service")).toBe("/book/frontend-development?source=service");
  });

  it("uses the fallback for external or malformed destinations", () => {
    expect(safeReturnTo("https://example.com")).toBe("/dashboard");
    expect(safeReturnTo("//example.com")).toBe("/dashboard");
    expect(safeReturnTo("/\\example.com")).toBe("/dashboard");
    expect(safeReturnTo(null, "/book")).toBe("/book");
  });
});
