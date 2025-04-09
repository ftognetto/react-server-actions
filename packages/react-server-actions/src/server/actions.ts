import { z } from 'zod';
import { decodeFormData, serialize } from './decode_form.js';
import {
  error,
  failure,
  isErrorActionResult,
  isFailureActionResult,
  success,
} from './helpers.js';
import {
  type ErrorActionResult,
  type FieldErrors,
  type InvalidActionResult,
} from './types.js';

export class ActionClient {
  handleError: boolean;

  constructor(options: { handleError: boolean } = { handleError: true }) {
    this.handleError = options.handleError;
  }

  // ** Action wrapper
  action = <Schema extends z.ZodTypeAny>(
    schema: Schema,
    fn: ({
      data,
      formData,
    }: {
      data: z.infer<Schema>;
      formData: FormData;
    }) => unknown,
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
        const actionResponse = await fn({
          data: parsedData.data,
          formData: data,
        });
        if (actionResponse && isFailureActionResult(actionResponse)) {
          // Permit to return a FailureActionResult from the action for custom validations
          return actionResponse as InvalidActionResult<Schema>;
        }
        if (actionResponse && isErrorActionResult(actionResponse)) {
          // Permit to return a ErrorActionResult from the action for custom errors
          return actionResponse as ErrorActionResult<Schema>;
        }
        return success<Schema>(serialize(parsedData.data), actionResponse);
      } catch (e: unknown) {
        if (this.handleError) {
          if (
            e instanceof Error &&
            (e.message === 'NEXT_REDIRECT' || e.message === 'NEXT_NOT_FOUND')
          ) {
            throw e;
          } else {
            return error<Schema>(serialize(parsedData.data), e);
          }
        } else {
          throw e;
        }
      }
    };
  };

  actionWithParam = <Schema extends z.ZodTypeAny>(
    schema: Schema,
    fn: ({
      param,
      data,
      formData,
    }: {
      param: string;
      data: z.infer<Schema>;
      formData: FormData;
    }) => unknown,
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
        const actionResponse = await fn({
          param,
          data: parsedData.data,
          formData: data,
        });
        if (actionResponse && isFailureActionResult(actionResponse)) {
          return actionResponse as InvalidActionResult<Schema>;
        }
        if (actionResponse && isErrorActionResult(actionResponse)) {
          return actionResponse as ErrorActionResult<Schema>;
        }
        return success<Schema>(serialize(parsedData.data), actionResponse);
      } catch (e: unknown) {
        if (this.handleError) {
          if (
            e instanceof Error &&
            (e.message === 'NEXT_REDIRECT' || e.message === 'NEXT_NOT_FOUND')
          ) {
            throw e;
          } else {
            return error<Schema>(serialize(parsedData.data), e);
          }
        } else {
          throw e;
        }
      }
    };
  };
}
