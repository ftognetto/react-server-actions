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
  actionConvertEmptyTo: ConvertEmptyToValue;
  actionWithParamConvertEmptyTo: ConvertEmptyToValue;
  log: boolean;

  constructor(
    options: {
      handleExceptionsAsFormErrors?: boolean;
      actionConvertEmptyTo?: ConvertEmptyToValue;
      actionWithParamConvertEmptyTo?: ConvertEmptyToValue;
      log?: boolean;
    } = {
      handleExceptionsAsFormErrors: true,
      actionConvertEmptyTo: 'undefined',
      actionWithParamConvertEmptyTo: 'undefined',
      log: false,
    },
  ) {
    this.handleExceptionsAsFormErrors =
      options.handleExceptionsAsFormErrors ?? true;
    this.actionConvertEmptyTo = options.actionConvertEmptyTo ?? 'undefined';
    this.actionWithParamConvertEmptyTo =
      options.actionWithParamConvertEmptyTo ?? 'undefined';
    this.log = options.log ?? false;
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
      if (this.log) {
        console.log('[react-server-actions] 1 formData', data);
      }
      const formData = decodeFormData(data, this.actionConvertEmptyTo);
      if (this.log) {
        console.log('[react-server-actions] 2 formData decoded', formData);
      }
      const parsedData = await schema.safeParseAsync(formData);
      if (this.log) {
        console.log('[react-server-actions] 3 parsedData', parsedData);
      }
      const serializedData = serialize(formData);
      if (this.log) {
        console.log('[react-server-actions] 4 serializedData', serializedData);
      }
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
      if (this.log) {
        console.log('[react-server-actions] 1 formData', data);
      }
      const formData = decodeFormData(data, this.actionWithParamConvertEmptyTo);
      if (this.log) {
        console.log('[react-server-actions] 2 formData decoded', formData);
      }
      const parsedData = await schema.safeParseAsync(formData);
      if (this.log) {
        console.log('[react-server-actions] 3 parsedData', parsedData);
      }
      const serializedData = serialize(formData);
      if (this.log) {
        console.log('[react-server-actions] 4 serializedData', serializedData);
      }
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
