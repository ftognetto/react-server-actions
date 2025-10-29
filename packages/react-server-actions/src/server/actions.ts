import { z } from 'zod';
import { decodeFormData, serialize } from './decode_form.js';
import {
  _actionError,
  _actionInvalid,
  _actionSuccess,
  error,
  invalid,
  isErrorActionResult,
  isInvalidActionResult,
} from './helpers.js';
import {
  type ActionResult,
  type ConvertEmptyToValue,
  type ErrorActionResultWithoutFormData,
  type FieldErrors,
  type InvalidActionResultWithoutFormData,
  type SuccessActionResultWithoutFormData,
} from './types.js';

export class ActionClient {
  handleExceptionsAsFormErrors: boolean;
  convertEmptyTo: ConvertEmptyToValue;

  constructor(
    options: {
      handleExceptionsAsFormErrors: boolean;
      convertEmptyTo: ConvertEmptyToValue;
    } = {
      handleExceptionsAsFormErrors: true,
      convertEmptyTo: 'undefined',
    },
  ) {
    this.handleExceptionsAsFormErrors = options.handleExceptionsAsFormErrors;
    this.convertEmptyTo = options.convertEmptyTo;
  }

  // ** Action wrapper
  action = <Schema extends z.ZodType<any>>(
    schema: Schema,
    fn: ({
      data,
      formData,
    }: {
      data: z.infer<Schema>;
      formData: FormData;
    }) => Promise<
      | SuccessActionResultWithoutFormData
      | InvalidActionResultWithoutFormData<Schema>
      | ErrorActionResultWithoutFormData
    >,
    options?: {
      handleExceptionsAsFormErrors?: boolean;
    },
  ) => {
    return async (
      _prevState: unknown,
      data: FormData,
    ): Promise<ActionResult<Schema>> => {
      const formData = decodeFormData(data, this.convertEmptyTo);
      const parsedData = await schema.safeParseAsync(formData);
      const serializedData = serialize(formData);
      if (!parsedData.success) {
        return _actionInvalid(
          serializedData,
          invalid<Schema>(
            parsedData.error.flatten().fieldErrors as FieldErrors<Schema>,
          ),
        );
      }
      try {
        const actionResponse = await fn({
          data: parsedData.data,
          formData: data,
        });
        if (actionResponse && isInvalidActionResult(actionResponse)) {
          // Permit to return a InvalidActionResult from the action for custom validations
          return _actionInvalid(
            serializedData,
            actionResponse as InvalidActionResultWithoutFormData<Schema>,
          );
        }
        if (actionResponse && isErrorActionResult(actionResponse)) {
          // Permit to return a ErrorActionResult from the action for custom errors
          return _actionError(
            serializedData,
            actionResponse as ErrorActionResultWithoutFormData,
          );
        }
        return _actionSuccess(
          serializedData,
          actionResponse as SuccessActionResultWithoutFormData,
        );
      } catch (e: unknown) {
        if (
          options?.handleExceptionsAsFormErrors ??
          this.handleExceptionsAsFormErrors
        ) {
          if (
            e instanceof Error &&
            (e.message === 'NEXT_REDIRECT' || e.message === 'NEXT_NOT_FOUND')
          ) {
            throw e;
          } else {
            return _actionError(serializedData, error(e));
          }
        } else {
          throw e;
        }
      }
    };
  };

  actionWithParam = <Schema extends z.ZodType<any>>(
    schema: Schema,
    fn: ({
      param,
      data,
      formData,
    }: {
      param: string;
      data: z.infer<Schema>;
      formData: FormData;
    }) => Promise<
      | SuccessActionResultWithoutFormData
      | InvalidActionResultWithoutFormData<Schema>
      | ErrorActionResultWithoutFormData
    >,
    options?: {
      handleExceptionsAsFormErrors?: boolean;
    },
  ) => {
    return async (
      param: string,
      _prevState: unknown,
      data: FormData,
    ): Promise<ActionResult<Schema>> => {
      const formData = decodeFormData(data, this.convertEmptyTo);
      const parsedData = await schema.safeParseAsync(formData);
      const serializedData = serialize(formData);
      if (!parsedData.success) {
        return _actionInvalid(
          serializedData,
          invalid<Schema>(
            parsedData.error.flatten().fieldErrors as FieldErrors<Schema>,
          ),
        );
      }
      try {
        const actionResponse = await fn({
          param,
          data: parsedData.data,
          formData: data,
        });
        if (actionResponse && isInvalidActionResult(actionResponse)) {
          return _actionInvalid(
            serializedData,
            actionResponse as InvalidActionResultWithoutFormData<Schema>,
          );
        }
        if (actionResponse && isErrorActionResult(actionResponse)) {
          return _actionError(
            serializedData,
            actionResponse as ErrorActionResultWithoutFormData,
          );
        }
        return _actionSuccess(
          serializedData,
          actionResponse as SuccessActionResultWithoutFormData,
        );
      } catch (e: unknown) {
        if (
          options?.handleExceptionsAsFormErrors ??
          this.handleExceptionsAsFormErrors
        ) {
          if (
            e instanceof Error &&
            (e.message === 'NEXT_REDIRECT' || e.message === 'NEXT_NOT_FOUND')
          ) {
            throw e;
          } else {
            return _actionError(serializedData, error(e));
          }
        } else {
          throw e;
        }
      }
    };
  };
}
