import { z } from 'zod';
// ** Action result types
export type IdleActionResult<Schema extends z.ZodTypeAny> = {
  success: false;
  formData: z.infer<Schema> | undefined;
  successData: undefined;
  invalid: undefined;
  error: undefined;
};
export type SuccessActionResult<Schema extends z.ZodTypeAny> = {
  success: true;
  formData: z.infer<Schema> | undefined;
  successData: any;
  invalid: undefined;
  error: undefined;
};
export type InvalidActionResult<Schema extends z.ZodTypeAny> = {
  success: false;
  formData: z.infer<Schema> | undefined;
  successData: undefined;
  invalid: FieldErrors<Schema> | undefined;
  error: undefined;
};
export type ErrorActionResult<Schema extends z.ZodTypeAny> = {
  success: false;
  formData: z.infer<Schema> | undefined;
  successData: undefined;
  invalid: undefined;
  error: string;
};
export type ActionResult<Schema extends z.ZodTypeAny> =
  | IdleActionResult<Schema>
  | SuccessActionResult<Schema>
  | InvalidActionResult<Schema>
  | ErrorActionResult<Schema>;

export type FieldErrors<Schema extends z.ZodTypeAny> = {
  [key in keyof Partial<z.TypeOf<Schema>>]: string[] | undefined;
};
