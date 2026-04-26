import { describe, expect, it } from "vitest";
import { computeWatering } from "../src/lib/watering";

const DAY = 86_400_000;

describe("computeWatering", () => {
  const now = new Date("2026-04-20T12:00:00Z");

  it("returns 'overdue' when last watering is older than frequency", () => {
    const last = new Date(now.getTime() - 10 * DAY);
    const r = computeWatering(last, 7, now);
    expect(r.status).toBe("overdue");
    expect(r.diffDays).toBe(-3);
  });

  it("returns 'due' when next watering falls today", () => {
    const last = new Date(now.getTime() - 7 * DAY);
    const r = computeWatering(last, 7, now);
    expect(r.status).toBe("due");
    expect(r.diffDays).toBe(0);
  });

  it("returns 'soon' when next watering is tomorrow", () => {
    const last = new Date(now.getTime() - 6 * DAY);
    const r = computeWatering(last, 7, now);
    expect(r.status).toBe("soon");
    expect(r.diffDays).toBe(1);
  });

  it("returns 'ok' when plenty of time remains", () => {
    const last = new Date(now.getTime() - 1 * DAY);
    const r = computeWatering(last, 7, now);
    expect(r.status).toBe("ok");
    expect(r.diffDays).toBe(6);
  });
});
