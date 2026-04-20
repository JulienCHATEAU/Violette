import { describe, expect, it } from "vitest";
import { PlantCreateInput } from "../src/lib/zod-schemas";

describe("PlantCreateInput", () => {
  it("accepts a minimal plant", () => {
    const r = PlantCreateInput.safeParse({ name: "Gérard" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.wateringFrequencyDays).toBe(7);
      expect(r.data.sunlightExposure).toBe("indirect_light");
      expect(r.data.humidity).toBe("medium");
    }
  });

  it("rejects empty name", () => {
    const r = PlantCreateInput.safeParse({ name: "" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid watering frequency", () => {
    const r = PlantCreateInput.safeParse({ name: "X", wateringFrequencyDays: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects invalid sunlight exposure", () => {
    const r = PlantCreateInput.safeParse({ name: "X", sunlightExposure: "moonlight" });
    expect(r.success).toBe(false);
  });

  it("no longer accepts photoUrl field silently (stripped)", () => {
    const r = PlantCreateInput.safeParse({ name: "X", photoUrl: "/foo.jpg" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect((r.data as Record<string, unknown>).photoUrl).toBeUndefined();
    }
  });
});
