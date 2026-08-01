import { describe, expect, it } from "vitest";
import { validatePingRequest } from "../src/domain/ping/ping-validator.js";
import { PING_LIMITS } from "@netvizlab/shared";

describe("validatePingRequest", () => {
  it("accepts a well-formed request", () => {
    const result = validatePingRequest({ host: "google.com", count: 4 });
    expect(result).toEqual({
      ok: true,
      value: { host: "google.com", count: 4 },
    });
  });

  it("clamps a count above the safety ceiling instead of failing", () => {
    const result = validatePingRequest({ host: "google.com", count: 999 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.count).toBe(PING_LIMITS.MAX_COUNT);
    }
  });

  it("rejects a missing host", () => {
    const result = validatePingRequest({ count: 4 });
    expect(result.ok).toBe(false);
  });

  it("rejects a host with shell metacharacters", () => {
    const result = validatePingRequest({ host: "$(whoami)", count: 4 });
    expect(result.ok).toBe(false);
  });
});
