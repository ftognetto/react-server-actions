'use client';

import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import type { ActionResult } from '../index.js';
import {
  dateToInputDefaultValue,
  getZodValidationAttributes,
} from './helpers.js';

const FormContext = React.createContext<{
  state?: ActionResult<z.ZodObject>;
  schema?: z.ZodObject;
  debug?: boolean;
}>({ state: undefined, schema: undefined, debug: false });

export const useForm = <Schema extends z.ZodObject>() => {
  const context = React.useContext(FormContext);
  if (!context.state || !context.schema)
    return { state: undefined, schema: undefined, debug: false };
  return {
    state: context.state as ActionResult<Schema>,
    schema: context.schema as Schema,
    debug: context.debug,
  };
};

const FieldContext = React.createContext<{ name: string; id: string }>({
  name: '',
  id: '',
});

type UseFieldReturn = {
  invalid: string[] | undefined;
  value: any;
  input: {
    id: string;
    name: string;
    //type?: string;
    'aria-invalid': boolean;
    autoComplete: 'on' | 'off' | undefined;
    defaultValue?: string;
    defaultChecked?: boolean;
  };
};
export const useField = <Schema extends z.ZodObject>(): UseFieldReturn => {
  'use no memo'; // the useField hook should not be memoized because the value will change
  const { name, id } = React.useContext(FieldContext);
  const { state, schema, debug } = useForm<Schema>();

  if (!state || !schema)
    throw new Error('<FormField> must be used within a <Form>');

  // Get validation attributes from schema
  const { type, attrs } = getZodValidationAttributes(schema, [name as string]);

  // Create the field object
  const field: UseFieldReturn = {
    invalid: state.invalid?.[name],
    value: state.formData?.[name],
    input: {
      id: id,
      name: name as string,
      'aria-invalid': !!state.invalid?.[name],
      autoComplete: undefined,
      ...attrs,
    },
  };

  // Set the default value for mantaining the state across submissions
  let defaultValue = state.formData?.[name];
  if (defaultValue && defaultValue instanceof Date) {
    defaultValue = dateToInputDefaultValue(defaultValue);
  }
  if (type === 'enum') {
    field.input.defaultValue = defaultValue as string;
    // TODO: This is not working if the input is a radio
    // if the input is a radio, we don't know which of the inputs is this one
  } else if (type === 'boolean') {
    if (defaultValue) {
      field.input.defaultChecked = defaultValue as boolean;
    } else {
      field.input.defaultChecked = false;
    }
  } else if (type === 'file') {
    // File inputs don't support default values, skip setting it
  } else {
    field.input.defaultValue = defaultValue as string;
  }
  // Set autocomplete for string inputs
  if (type === 'string') {
    field.input.autoComplete = 'on';
  }
  if (debug) {
    console.log(field);
  }
  return field;
};

export function Form<Schema extends z.ZodObject>({
  children,
  action,
  state,
  schema,
  className,
  reset,
  onSuccess,
  onError,
  debug,
  ...props
}: React.ComponentProps<'form'> & {
  children: React.ReactNode;
  action: (payload: FormData) => void;
  state: ActionResult<Schema>;
  schema: Schema;
  className?: string;
  reset?: boolean;
  onSuccess?: (data: any, formData: z.TypeOf<Schema> | undefined) => void;
  onError?: (error: string) => void;
  debug?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  if (reset !== false) {
    if (formRef.current && state.success) {
      formRef.current.reset();
    }
  }
  useEffect(() => {
    if (state.success) {
      onSuccess?.(state.data, state.formData);
    } else if (state.error) {
      onError?.(state.error);
    }
  }, [state, onSuccess, onError]);

  return (
    <FormContext.Provider value={{ state, schema, debug }}>
      <form action={action} ref={formRef} className={className} {...props}>
        {children}
      </form>
    </FormContext.Provider>
  );
}

export function FormField<Schema extends z.ZodObject>({
  render,
  name,
}: {
  render: (field: ReturnType<typeof useField>) => React.ReactNode;
  name: keyof z.TypeOf<Schema>;
}) {
  const id = React.useId();
  return (
    <FieldContext.Provider value={{ name: name as string, id }}>
      <FormFieldRenderer render={render} />
    </FieldContext.Provider>
  );
}

function FormFieldRenderer<Schema extends z.ZodObject>({
  render,
}: {
  render: (field: ReturnType<typeof useField>) => React.ReactNode;
}) {
  const field = useField<Schema>();
  return render(field);
}
