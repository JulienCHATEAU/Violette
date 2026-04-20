import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-at-least-32-bytes-long-aaaaaaaaaaaaaaaa";
});

describe("session token", () => {
  it("signs then verifies round-trip", async () => {
    const { signSession, verifySession } = await import("../src/lib/auth/session");
    const token = await signSession({ sub: "u1", username: "julien" });
    const claims = await verifySession(token);
    expect(claims?.sub).toBe("u1");
    expect(claims?.username).toBe("julien");
  });

  it("returns null on invalid token", async () => {
    const { verifySession } = await import("../src/lib/auth/session");
    expect(await verifySession("not.a.jwt")).toBeNull();
  });

  it("returns null on token signed with another secret", async () => {
    const { signSession } = await import("../src/lib/auth/session");
    const token = await signSession({ sub: "u1", username: "julien" });
    process.env.AUTH_SECRET = "some-other-secret-at-least-32-bytes-long-bbbbbbbbb";
    const { verifySession } = await import("../src/lib/auth/session");
    expect(await verifySession(token)).toBeNull();
    process.env.AUTH_SECRET = "test-secret-at-least-32-bytes-long-aaaaaaaaaaaaaaaa";
  });
});
