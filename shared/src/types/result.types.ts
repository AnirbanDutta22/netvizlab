import type { AppError } from "../errors/app-error.js";

export type Result<TValue, TError = AppError> =
  | {
      readonly ok: true;
      readonly value: TValue;
    }
  | {
      readonly ok: false;
      readonly error: TError;
    };

// TValue is automatically inferred from the argument.
export const ok = <TValue, TError = AppError>(
  value: TValue,
): Result<TValue, TError> => ({
  ok: true,
  value,
});

// TValue defaults to 'never' since no success value exists.
export const err = <TValue = never, TError = AppError>(
  error: TError,
): Result<TValue, TError> => ({
  ok: false,
  error,
});
