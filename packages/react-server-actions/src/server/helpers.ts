import type { z } from 'zod';
import type {
  ErrorActionResult,
  FieldErrors,
  IdleActionResult,
  InvalidActionResult,
  SuccessActionResult,
} from './types.js';

// ** Action result constructors helpers
export const success = <Schema extends z.ZodTypeAny>(
  formData: z.infer<Schema>,
  successData: any,
) =>
  ({
    success: true,
    formData,
    successData,
    invalid: undefined,
    error: undefined,
  }) satisfies SuccessActionResult<Schema>;

export const failure = <Schema extends z.ZodTypeAny>(
  formData: z.infer<Schema>,
  invalid: FieldErrors<Schema>,
) =>
  ({
    success: false,
    formData, // pass down the data even if there are errors to leave the form filled
    successData: undefined,
    invalid,
    error: undefined,
  }) satisfies InvalidActionResult<Schema>;

export const error = <Schema extends z.ZodTypeAny>(
  formData: z.infer<Schema>,
  error: unknown,
) =>
  ({
    formData, // pass down the data even if there are errors to leave the form filled
    successData: undefined,
    success: false,
    invalid: undefined,
    error: error instanceof Error ? error.message : JSON.stringify(error),
  }) satisfies ErrorActionResult<Schema>;

export function actionInvalid<Schema extends z.ZodTypeAny>(
  formData: z.infer<Schema>,
  field: keyof z.TypeOf<Schema>,
  error: string,
) {
  return {
    invalid: {
      [field]: error,
    } as unknown as FieldErrors<Schema>,
    success: false,
    error: undefined,
    formData, // pass down the data even if there are errors to leave the form filled
    successData: undefined,
  } satisfies InvalidActionResult<Schema>;
}

export function actionError<Schema extends z.ZodTypeAny>(
  formData: z.infer<Schema>,
  error: string,
) {
  return {
    invalid: undefined,
    success: false,
    error: error,
    formData, // pass down the data even if there are errors to leave the form filled
    successData: undefined,
  } satisfies ErrorActionResult<Schema>;
}

// ** Action result typeguards
export const isFailureActionResult = <Schema extends z.ZodTypeAny>(
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

export const isErrorActionResult = <Schema extends z.ZodTypeAny>(
  actionResult: unknown,
): actionResult is ErrorActionResult<Schema> => {
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
export const initialState = <Schema extends z.ZodTypeAny>(
  formData: z.infer<Schema> | undefined,
) =>
  ({
    success: false,
    formData,
    successData: undefined,
    invalid: undefined,
    error: undefined,
  }) satisfies IdleActionResult<Schema>;
