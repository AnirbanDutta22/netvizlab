import {
  createAppError,
  err,
  ok,
  type AppError,
  type Result,
} from "@netvizlab/shared";

// Strict allowlist pattern for hostnames and IPv4/IPv6 addresses.
const HOSTNAME_PATTERN =
  /^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?:\.(?!-)[A-Za-z0-9-]{1,63})*\.?$/;

const IPV4_PATTERN =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

const IPV6_PATTERN = /^[0-9A-Fa-f:]{2,39}$/;

export const validateHost = (rawHost: string): Result<string, AppError> => {
  const host = rawHost.trim();

  if (host.length === 0) {
    return err(createAppError("VALIDATION_ERROR", "Host must not be empty")); // returns {ok:false, error:{code,message}}
  }

  if (host.length > 253) {
    return err(createAppError("VALIDATION_ERROR", "Host is too long")); // returns {ok:false, error:{code,message}}
  }

  // Reject anything that isn't strictly alphanumeric/dots/dashes/colons
  if (!/^[A-Za-z0-9.:-]+$/.test(host)) {
    return err(
      createAppError(
        "VALIDATION_ERROR",
        "Host contains characters that are not allowed.",
        {
          host,
        },
      ),
    ); // returns {ok:false, error:{code,message,details}}
  }

  const isValid =
    HOSTNAME_PATTERN.test(host) ||
    IPV4_PATTERN.test(host) ||
    IPV6_PATTERN.test(host);

  if (!isValid) {
    return err(
      createAppError(
        "VALIDATION_ERROR",
        "Host is not a valid hostname or IP Address",
      ),
    ); // returns {ok:false, error:{code,message}}
  }

  return ok(host); // returns {ok:true, value:host}
};

/*
example - clampInt(5.7, 1, 10)
5.7 truncates to 5.
Fits between 1 and 10.
Returns 5
*/
export const clampInt = (value: number, min: number, max: number): number =>
  Math.min(Math.max(Math.trunc(value), min), max);
