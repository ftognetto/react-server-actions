import { z } from 'zod';
import { decodeFormData, serialize } from './decode_form.js';
import { error, failure, isFailureActionResult, success } from './helpers.js';
import { type FieldErrors, type InvalidActionResult } from './types.js';
// ** Action wrapper
export const action = <Schema extends z.ZodTypeAny>(
  schema: Schema,
  fn: (data: z.infer<Schema>) => unknown,
) => {
  return async (_prevState: unknown, data: FormData) => {
    const formData = decodeFormData(data);
    const parsedData = await schema.safeParseAsync(formData);
    if (!parsedData.success) {
      return failure<Schema>(
        serialize(formData),
        parsedData.error.flatten().fieldErrors as FieldErrors<Schema>,
      );
    }
    try {
      const actionResponse = await fn(parsedData.data);
      if (actionResponse && isFailureActionResult(actionResponse)) {
        // Permit to return a FailureActionResult from the action for custom validations
        return actionResponse as InvalidActionResult<Schema>;
      }
      return success<Schema>(serialize(parsedData.data), actionResponse);
    } catch (e: unknown) {
      if (
        e instanceof Error &&
        (e.message === 'NEXT_REDIRECT' || e.message === 'NEXT_NOT_FOUND')
      ) {
        throw e;
      } else {
        return error<Schema>(serialize(parsedData.data), e);
      }
    }
  };
};

export const actionWithParam = <Schema extends z.ZodTypeAny>(
  schema: Schema,
  fn: (param: string, data: z.infer<Schema>) => unknown,
) => {
  return async (param: string, _prevState: unknown, data: FormData) => {
    const formData = decodeFormData(data);
    const parsedData = await schema.safeParseAsync(formData);
    if (!parsedData.success) {
      return failure<Schema>(
        serialize(formData),
        parsedData.error.flatten().fieldErrors as FieldErrors<Schema>,
      );
    }
    try {
      const actionResponse = await fn(param, parsedData.data);
      if (actionResponse && isFailureActionResult(actionResponse)) {
        return actionResponse as InvalidActionResult<Schema>;
      }
      return success<Schema>(serialize(parsedData.data), actionResponse);
    } catch (e: unknown) {
      if (
        e instanceof Error &&
        (e.message === 'NEXT_REDIRECT' || e.message === 'NEXT_NOT_FOUND')
      ) {
        throw e;
      } else {
        return error<Schema>(serialize(parsedData.data), e);
      }
    }
  };
};
