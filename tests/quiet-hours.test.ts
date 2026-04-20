import { describe, expect, it } from "vitest";
import { isQuietNow } from "../src/lib/push/quiet-hours";

const at = (h: number) => new Date(2026, 3, 20, h, 0, 0);

describe("isQuietNow", () => {
  it("is false when bounds are null", () => {
    expect(isQuietNow(null, null, at(3))).toBe(false);
    expect(isQuietNow(undefined, 8, at(3))).toBe(false);
  });

  it("is false when start === end", () => {
    expect(isQuietNow(8, 8, at(8))).toBe(false);
  });

  it("handles simple window (9 → 17)", () => {
    expect(isQuietNow(9, 17, at(8))).toBe(false);
    expect(isQuietNow(9, 17, at(9))).toBe(true);
    expect(isQuietNow(9, 17, at(16))).toBe(true);
    expect(isQuietNow(9, 17, at(17))).toBe(false);
  });

  it("handles window wrapping midnight (22 → 8)", () => {
    expect(isQuietNow(22, 8, at(23))).toBe(true);
    expect(isQuietNow(22, 8, at(3))).toBe(true);
    expect(isQuietNow(22, 8, at(7))).toBe(true);
    expect(isQuietNow(22, 8, at(8))).toBe(false);
    expect(isQuietNow(22, 8, at(12))).toBe(false);
    expect(isQuietNow(22, 8, at(21))).toBe(false);
  });
});
