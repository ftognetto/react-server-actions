'use client';

import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import type { ActionResult } from '../index.js';
import {
  datetimeToInputDefaultValue,
  dateToInputDefaultValue,
  getZodValidationAttributes,
} from './helpers.js';

const FormContext = React.createContext<{
  state?: ActionResult<z.AnyZodObject>;
  schema?: z.AnyZodObject;
}>({ state: undefined, schema: undefined });

const useForm = <Schema extends z.AnyZodObject>() => {
  const context = React.useContext(FormContext);
  if (!context.state || !context.schema)
    return { state: undefined, schema: undefined };
  return {
    state: context.state as ActionResult<Schema>,
    schema: context.schema as Schema,
  };
};

const FieldContext = React.createContext<{ name: string }>({ name: '' });

export const useField = <Schema extends z.AnyZodObject>() => {
  'use no memo'; // the useField hook should not be memoized because the value will change
  const { name } = React.useContext(FieldContext);
  const { state, schema } = useForm<Schema>();

  if (!state || !schema)
    throw new Error('<FormField> must be used within a <Form>');

  const id = React.useId();

  // Get validation attributes from schema
  const validationAttrs = getZodValidationAttributes(schema, [name as string]);
  let defaultValue = state.formData?.[name];
  if (validationAttrs.type === 'date') {
    defaultValue = defaultValue
      ? dateToInputDefaultValue(defaultValue)
      : undefined;
  }
  if (
    validationAttrs.type === 'datetime-local' &&
    defaultValue instanceof Date
  ) {
    defaultValue = defaultValue
      ? datetimeToInputDefaultValue(defaultValue)
      : undefined;
  }

  return {
    invalid: state.invalid?.[name],
    value: state.formData?.[name],
    input: {
      id: id,
      name: name as string,
      defaultValue: defaultValue,
      defaultChecked: defaultValue,
      'aria-invalid': !!state.invalid?.[name],
      ...validationAttrs,
    },
  };
};

export function Form<Schema extends z.AnyZodObject>({
  children,
  action,
  state,
  schema,
  className,
  reset,
  onSuccess,
  onError,
}: {
  children: React.ReactNode;
  action: (payload: FormData) => void;
  state: ActionResult<Schema>;
  schema: Schema;
  className?: string;
  reset?: boolean;
  onSuccess?: (
    successData: any,
    formData: z.TypeOf<Schema> | undefined,
  ) => void;
  onError?: (error: string) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  if (reset !== false) {
    if (formRef.current && state.success) {
      formRef.current.reset();
    }
  }
  useEffect(() => {
    if (state.success) {
      onSuccess?.(state.successData, state.formData);
    } else if (state.error) {
      onError?.(state.error);
    }
  }, [state, onSuccess, onError]);

  return (
    <FormContext.Provider value={{ state, schema }}>
      <form action={action} ref={formRef} className={className}>
        {children}
      </form>
    </FormContext.Provider>
  );
}

export function FormField<Schema extends z.AnyZodObject>({
  render,
  name,
}: {
  render: (field: ReturnType<typeof useField>) => React.ReactNode;
  name: keyof z.TypeOf<Schema>;
}) {
  return (
    <FieldContext.Provider value={{ name: name as string }}>
      <FormFieldRenderer render={render} />
    </FieldContext.Provider>
  );
}

function FormFieldRenderer<Schema extends z.AnyZodObject>({
  render,
}: {
  render: (field: ReturnType<typeof useField>) => React.ReactNode;
}) {
  const field = useField<Schema>();
  return render(field);
}
