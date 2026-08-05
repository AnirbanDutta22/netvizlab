/**
 * `crypto.randomUUID()` is only exposed in a "secure context" (HTTPS, or
 * `localhost`). It works in dev because Vite serves on localhost, but a
 * production deployment served over plain HTTP on any other host will have
 * `crypto.randomUUID` as `undefined`, causing "crypto.randomUUID is not a
 * function" at call time.
 *
 * `crypto.getRandomValues`, on the other hand, is available in every
 * context regardless of security, so we use it to build an equivalent
 * RFC 4122 v4 UUID whenever `randomUUID` isn't present.
 */
export const generateId = (): string => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // Per RFC 4122: set version (4) and variant (10) bits.
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
};
