import { AppError } from "../errors/app-error";

export type Result<TValue, TError = AppError> =
  | {
      readonly ok: true;
      readonly value: TValue;
    }
  | {
      readonly ok: false;
      readonly error: TError;
    };

export const ok = <TValue, TError = AppError>(
  value: TValue,
): Result<TValue, TError> => ({
  ok: true,
  value,
});

export const err = <TValue = never, TError = AppError>(
  error: TError,
): Result<TValue, TError> => ({
  ok: false,
  error,
});
