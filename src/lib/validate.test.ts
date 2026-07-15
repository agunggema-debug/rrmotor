import { describe, it, expect } from "vitest";
import { str, num, httpUrl, oneOf } from "@/lib/validate";
import { HttpError } from "@/lib/http";

describe("str", () => {
  it("trims whitespace", () => {
    expect(str("  halo  ")).toBe("halo");
  });

  it("returns '' for null when optional", () => {
    expect(str(null)).toBe("");
  });

  it("throws HttpError when required but empty", () => {
    expect(() => str("", { required: true, field: "nama" })).toThrow(HttpError);
  });

  it("throws HttpError when exceeding max length", () => {
    expect(() => str("abcdef", { max: 3 })).toThrow(HttpError);
  });
});

describe("num", () => {
  it("parses numeric string", () => {
    expect(num("42")).toBe(42);
  });

  it("returns 0 for null when optional", () => {
    expect(num(null)).toBe(0);
  });

  it("throws when not a number", () => {
    expect(() => num("abc", { field: "x" })).toThrow(HttpError);
  });

  it("throws when below min", () => {
    expect(() => num(-1, { min: 0 })).toThrow(HttpError);
  });

  it("throws when not integer", () => {
    expect(() => num(1.5, { integer: true })).toThrow(HttpError);
  });
});

describe("httpUrl", () => {
  it("accepts https url", () => {
    expect(httpUrl("https://example.com/a.png")).toBe(
      "https://example.com/a.png"
    );
  });

  it("rejects javascript: scheme", () => {
    expect(() => httpUrl("javascript:alert(1)")).toThrow(HttpError);
  });
});

describe("oneOf", () => {
  it("returns value when allowed", () => {
    expect(oneOf("cash", ["cash", "qris"] as const)).toBe("cash");
  });

  it("throws when not allowed", () => {
    expect(() => oneOf("bitcoin", ["cash", "qris"] as const)).toThrow(
      HttpError
    );
  });
});
