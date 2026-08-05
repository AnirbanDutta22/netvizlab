import { describe, expect, it } from "vitest";
import { generateId } from "../src/shared/utils/generate-id";

describe("generateId", () => {
  it("returns a string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
  });

  it("looks like a UUID (8-4-4-4-12 hex groups)", () => {
    const id = generateId();
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    expect(id).toMatch(uuidPattern);
  });

  it("returns a different id every time it's called", () => {
    const first = generateId();
    const second = generateId();

    expect(first).not.toBe(second);
  });
});
