import { z } from "zod";
import {
  type AppError,
  createAppError,
  err,
  ok,
  PING_LIMITS,
  type PingRequestDto,
  type Result,
} from "@netvizlab/shared";
import { clampInt, validateHost } from "../shared/host-validator.js";

const pingRequestSchema = z.object({
  host: z.string().min(1).max(253),
  count: z.number().int().min(PING_LIMITS.MIN_COUNT).max(100_000),
});

export const validatePingRequest = (
  input: unknown,
): Result<PingRequestDto, AppError> => {
  const parsed = pingRequestSchema.safeParse(input);

  if (!parsed.success) {
    return err(
      createAppError("VALIDATION_ERROR", "Invalid ping request payload.", {
        issues: parsed.error.flatten().fieldErrors,
      }),
    ); // returns {ok: false, error:{code,message,details}}
  }

  const hostResult = validateHost(parsed.data.host);
  if (!hostResult.ok) {
    return hostResult; // returns {ok: false, error: AppError}
  }

  const count = clampInt(
    parsed.data.count,
    PING_LIMITS.MIN_COUNT,
    PING_LIMITS.MAX_COUNT,
  );

  return ok({ host: hostResult.value, count }); // returns {ok:true, value:{host,count}}
};
