import { z } from 'zod';
// ** Action result types returned from user
export type IdleActionResultWithoutFormData = Pick<
  ActionResult<z.ZodType<any>>,
  'success' | 'data' | 'invalid' | 'error'
>;
export type SuccessActionResultWithoutFormData = Pick<
  SuccessActionResult<z.ZodType<any>>,
  'success' | 'data'
>;
export type InvalidActionResultWithoutFormData<Schema extends z.ZodType<any>> =
  Pick<InvalidActionResult<Schema>, 'success' | 'invalid'>;
export type ErrorActionResultWithoutFormData = Pick<
  ErrorActionResult<z.ZodType<any>>,
  'success' | 'error'
>;
export type ActionResultWithoutFormData<Schema extends z.ZodType<any>> =
  | IdleActionResultWithoutFormData
  | SuccessActionResultWithoutFormData
  | InvalidActionResultWithoutFormData<Schema>
  | ErrorActionResultWithoutFormData;

// ** Action result types returned from the library (it adds the formData to the result)
export type IdleActionResult<Schema extends z.ZodType<any>> = {
  formData: z.infer<Schema> | undefined;
  success: false;
  data: undefined;
  invalid: undefined;
  error: undefined;
};
export type SuccessActionResult<Schema extends z.ZodType<any>> = {
  formData: z.infer<Schema> | undefined;
  success: true;
  data: any;
  invalid: undefined;
  error: undefined;
};
export type InvalidActionResult<Schema extends z.ZodType<any>> = {
  formData: z.infer<Schema> | undefined;
  success: false;
  data: undefined;
  invalid: FieldErrors<Schema> | undefined;
  error: undefined;
};
export type ErrorActionResult<Schema extends z.ZodType<any>> = {
  formData: z.infer<Schema> | undefined;
  success: false;
  data: undefined;
  invalid: undefined;
  error: string;
};
export type ActionResult<Schema extends z.ZodType<any>> =
  | IdleActionResult<Schema>
  | SuccessActionResult<Schema>
  | InvalidActionResult<Schema>
  | ErrorActionResult<Schema>;

export type FieldErrors<Schema extends z.ZodType<any>> = {
  [key in keyof Partial<z.TypeOf<Schema>>]: string[] | undefined;
};
/** Utils */
export type ConvertEmptyToValue = 'undefined' | 'null' | 'empty-string';
