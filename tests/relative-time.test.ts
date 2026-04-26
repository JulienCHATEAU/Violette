import { describe, expect, it } from "vitest";
import { relativeTimeFr } from "@/lib/relative-time";

const NOW = new Date("2026-04-26T12:00:00.000Z");
const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

function past(ms: number) {
  return new Date(NOW.getTime() - ms);
}

describe("relativeTimeFr", () => {
  it("returns 'à l'instant' under one minute", () => {
    expect(relativeTimeFr(past(30 * SECOND), NOW)).toBe("à l'instant");
    expect(relativeTimeFr(past(0), NOW)).toBe("à l'instant");
  });

  it("returns minutes under one hour", () => {
    expect(relativeTimeFr(past(5 * MINUTE), NOW)).toBe("il y a 5 min");
  });

  it("returns hours under one day", () => {
    expect(relativeTimeFr(past(3 * HOUR), NOW)).toBe("il y a 3 h");
  });

  it("returns 'hier' for the previous day window", () => {
    expect(relativeTimeFr(past(26 * HOUR), NOW)).toBe("hier");
  });

  it("returns days under one month", () => {
    expect(relativeTimeFr(past(7 * DAY), NOW)).toBe("il y a 7 j");
  });

  it("returns 'il y a 1 mois' singular and plural months", () => {
    expect(relativeTimeFr(past(35 * DAY), NOW)).toBe("il y a 1 mois");
    expect(relativeTimeFr(past(3 * MONTH), NOW)).toBe("il y a 3 mois");
  });

  it("returns years singular and plural", () => {
    expect(relativeTimeFr(past(YEAR + DAY), NOW)).toBe("il y a 1 an");
    expect(relativeTimeFr(past(2 * YEAR), NOW)).toBe("il y a 2 ans");
  });

  it("accepts ISO string input", () => {
    const iso = past(7 * DAY).toISOString();
    expect(relativeTimeFr(iso, NOW)).toBe("il y a 7 j");
  });

  it("clamps future dates back to 'à l'instant'", () => {
    expect(relativeTimeFr(new Date(NOW.getTime() + 5 * MINUTE), NOW)).toBe("à l'instant");
  });
});
