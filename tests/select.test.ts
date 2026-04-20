import { describe, expect, it } from "vitest";
import { selectTemplate } from "../src/lib/push/select";
import type { Template } from "../src/lib/push/templates/types";

const CATALOG: Template[] = [
  { id: "a", contexts: ["due"], tones: ["funny"], title: "A", body: "a" },
  { id: "b", contexts: ["due"], tones: ["formal"], title: "B", body: "b" },
  { id: "c", contexts: ["overdue_light"], tones: ["sassy"], title: "C", body: "c" },
  { id: "d", contexts: ["due", "overdue_light"], tones: ["funny"], title: "D", body: "d" },
  { id: "e", contexts: ["greeting"], tones: ["zen"], title: "E", body: "e" },
];

describe("selectTemplate", () => {
  it("returns null when no template matches the context", () => {
    expect(selectTemplate([], { context: "due" })).toBeNull();
    expect(selectTemplate(CATALOG, { context: "overdue_severe" })).toBeNull();
  });

  it("returns a matching template for the context", () => {
    const picked = selectTemplate(CATALOG, { context: "greeting" });
    expect(picked?.id).toBe("e");
  });

  it("filters out recently-used ids when possible", () => {
    const picked = selectTemplate(CATALOG, {
      context: "due",
      recentIds: ["a", "b"],
    });
    expect(picked?.id).toBe("d");
  });

  it("falls back to the full pool when all are recent", () => {
    const picked = selectTemplate(CATALOG, {
      context: "due",
      recentIds: ["a", "b", "d"],
    });
    expect(picked).not.toBeNull();
    expect(["a", "b", "d"]).toContain(picked!.id);
  });

  it("filters by tone when provided", () => {
    const picked = selectTemplate(CATALOG, { context: "due", tones: ["formal"] });
    expect(picked?.id).toBe("b");
    expect(selectTemplate(CATALOG, { context: "due", tones: ["dramatic"] })).toBeNull();
  });
});
