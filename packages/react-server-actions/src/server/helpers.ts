import type { z } from 'zod';
import type {
  ErrorActionResult,
  ErrorActionResultWithFormData,
  FieldErrors,
  IdleActionResultWithFormData,
  InvalidActionResult,
  InvalidActionResultWithFormData,
  SuccessActionResult,
  SuccessActionResultWithFormData,
} from './types.js';

// ** Action result constructors helpers
// ** Public helpers
export const success = (data: any) =>
  ({
    success: true,
    data,
  }) satisfies SuccessActionResult;

export const invalid = <Schema extends z.ZodType<any>>(
  invalid: FieldErrors<Schema>,
) =>
  ({
    success: false,
    invalid,
  }) satisfies InvalidActionResult<Schema>;

export const error = (error: unknown) =>
  ({
    success: false,
    error:
      typeof error === 'string'
        ? error
        : error instanceof Error
          ? error.message
          : JSON.stringify(error),
  }) satisfies ErrorActionResult;

// ** Private helpers
export function _actionSuccess<Schema extends z.ZodType<any>>(
  formData: z.infer<Schema>,
  actionResult: SuccessActionResult,
) {
  return {
    ...actionResult,
    formData, // pass down the data to leave the form filled
    invalid: undefined,
    error: undefined,
  } satisfies SuccessActionResultWithFormData<Schema>;
}

export function _actionInvalid<Schema extends z.ZodType<any>>(
  formData: z.infer<Schema>,
  actionResult: InvalidActionResult<Schema>,
) {
  return {
    ...actionResult,
    formData, // pass down the data to leave the form filled
    data: undefined,
    error: undefined,
  } satisfies InvalidActionResultWithFormData<Schema>;
}

export function _actionError<Schema extends z.ZodType<any>>(
  formData: z.infer<Schema>,
  actionResult: ErrorActionResult,
) {
  return {
    ...actionResult,
    formData, // pass down the data to leave the form filled
    invalid: undefined,
    data: undefined,
  } satisfies ErrorActionResultWithFormData<Schema>;
}

// ** Action result typeguards
export const isInvalidActionResult = <Schema extends z.ZodType<any>>(
  actionResult: unknown,
): actionResult is InvalidActionResult<Schema> => {
  return (
    typeof actionResult === 'object' &&
    actionResult !== null &&
    'success' in actionResult &&
    actionResult.success === false &&
    'invalid' in actionResult &&
    actionResult.invalid !== undefined
  );
};

export const isErrorActionResult = (
  actionResult: unknown,
): actionResult is ErrorActionResult => {
  return (
    typeof actionResult === 'object' &&
    actionResult !== null &&
    'success' in actionResult &&
    actionResult.success === false &&
    'error' in actionResult &&
    actionResult.error !== undefined
  );
};

// ** Initial state helper
export const initialState = <Schema extends z.ZodType<any>>(
  formData: z.infer<Schema> | undefined,
) =>
  ({
    success: false,
    formData,
    data: undefined,
    invalid: undefined,
    error: undefined,
  }) satisfies IdleActionResultWithFormData<Schema>;
