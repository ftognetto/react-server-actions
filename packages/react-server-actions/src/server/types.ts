import { z } from 'zod';
// ** Action result types returned from user
export type IdleActionResult = Pick<
  ActionResultWithFormData<z.ZodType<any>>,
  'success' | 'data' | 'invalid' | 'error'
>;
export type SuccessActionResult = Pick<
  SuccessActionResultWithFormData<z.ZodType<any>>,
  'success' | 'data'
>;
export type InvalidActionResult<Schema extends z.ZodType<any>> = Pick<
  InvalidActionResultWithFormData<Schema>,
  'success' | 'invalid'
>;
export type ErrorActionResult = Pick<
  ErrorActionResultWithFormData<z.ZodType<any>>,
  'success' | 'error'
>;
export type ActionResult<Schema extends z.ZodType<any>> =
  | IdleActionResult
  | SuccessActionResult
  | InvalidActionResult<Schema>
  | ErrorActionResult;

// ** Action result types returned from the library (it adds the formData to the result)
export type IdleActionResultWithFormData<Schema extends z.ZodType<any>> = {
  formData: z.infer<Schema> | undefined;
  success: false;
  data: undefined;
  invalid: undefined;
  error: undefined;
};
export type SuccessActionResultWithFormData<Schema extends z.ZodType<any>> = {
  formData: z.infer<Schema> | undefined;
  success: true;
  data: any;
  invalid: undefined;
  error: undefined;
};
export type InvalidActionResultWithFormData<Schema extends z.ZodType<any>> = {
  formData: z.infer<Schema> | undefined;
  success: false;
  data: undefined;
  invalid: FieldErrors<Schema> | undefined;
  error: undefined;
};
export type ErrorActionResultWithFormData<Schema extends z.ZodType<any>> = {
  formData: z.infer<Schema> | undefined;
  success: false;
  data: undefined;
  invalid: undefined;
  error: string;
};
export type ActionResultWithFormData<Schema extends z.ZodType<any>> =
  | IdleActionResultWithFormData<Schema>
  | SuccessActionResultWithFormData<Schema>
  | InvalidActionResultWithFormData<Schema>
  | ErrorActionResultWithFormData<Schema>;

export type FieldErrors<Schema extends z.ZodType<any>> = {
  [key in keyof Partial<z.TypeOf<Schema>>]: string[] | undefined;
};
/** Utils */
export type ConvertEmptyToValue = 'undefined' | 'null' | 'empty-string';
