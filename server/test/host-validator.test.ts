import { describe, expect, it } from "vitest";
import { validateHost } from "../src/domain/shared/host-validator.js";

// Anything with shell metacharacters must be rejected before it ever reaches spawn().
describe("validateHost", () => {
  it("accepts a normal hostname", () => {
    const result = validateHost("google.com");
    expect(result).toEqual({ ok: true, value: "google.com" });
  });

  it("accepts a valid IPv4 address", () => {
    const result = validateHost("8.8.8.8");
    expect(result.ok).toBe(true);
  });

  it("rejects an empty host", () => {
    const result = validateHost("   ");
    expect(result.ok).toBe(false);
  });

  it("rejects input containing shell metacharacters", () => {
    const malicious = "google.com; rm -rf /";
    const result = validateHost(malicious);
    expect(result.ok).toBe(false);
  });

  it("rejects input that looks like a command flag", () => {
    const result = validateHost("--some-flag");
    expect(result.ok).toBe(false);
  });

  it("rejects a host that is too long", () => {
    const result = validateHost(`${"a".repeat(260)}.com`);
    expect(result.ok).toBe(false);
  });
});
