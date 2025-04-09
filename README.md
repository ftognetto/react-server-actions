# React Server Actions

A lightweight library for handling server actions in React and Next.js applications using server side zod validation and native html client side validation.

## Intro

React Server Actions represent a groundbreaking advancement in how we handle server-side operations in React applications. However, while the APIs provided by the React team are powerful, developers often face challenges in establishing consistent patterns for handling responses, validation, and error management. This is where this library comes in.

React Server Actions was born out of the need to address these gaps in the implementation of React's new server actions feature. Rather than replacing the native functionality, this library builds upon it by providing a structured approach to server actions. The core idea is to establish a well-defined shape for server action responses, making them predictable and easier to work with.

This is how we define a server action with the help of react-server-actions library.

```typescript
export const zodSchema = z.object({
    name: z.string().min(1),
    ...
})
```

```typescript
'use server';

// the action wrapper will take care of validate data and will wrap the response into a ActionResult type!
export const someAction = action(zodSchema, async (data) => {
  // data is already validated and is typed
  return {
    something: 'whatever',
  };
});
```

By providing this structure, the library enables developers to create more robust client-side components that can confidently interact with server actions. It combines the power of Zod for server-side validation with native HTML validation attributes, creating a seamless development experience while maintaining type safety throughout the application. The result is a more organized and maintainable codebase that follows best practices for handling server-client interactions.

```typescript
'use client'
export default function Form() {
    const [state, action, pending] = useActionState(someAction, initialState());

    console.log(state.formData?.name); // state will be always of type ActionResult
    console.log(state.invalid?.name); // it will contain the data and eventually the validation problems

    return (
        <Form state={state} action={action} schema={schema}>
            <FormField
                name="name"
                render={(field) => (
                <div>
                    <label htmlFor={field.input.id} className={field.invalid ? 'text-red-500' : ''}>Name</label>
                    <input {...field.input} type="text"  />
                    {field.invalid && <p className="text-red-500">{field.invalid}</p>}
                </div>
                )}
            />
        </Form>
    );
}
```

```typescript
// The ActionResult type
export type ActionResult<Schema> = {
    success: boolean;
    formData: z.infer<Schema> | undefined; // Data submitted
    successData: any; // Data returned from the user
    invalid: [key in keyof Partial<z.TypeOf<Schema>>]: string[] | undefined; // Validation fields
    error: string | undefined;
}
```

## Features

### Server-Side Features

#### Structured Action Responses

- Standardized response shape for consistent error and success handling
- Type-safe responses with proper error typing
- Built-in support for validation errors and server errors

#### Form Data Processing

- Built-in form data decoder for easy access to form fields
- Support for complex form structures including nested objects and arrays
- Automatic type inference from your Zod schemas

#### Zod Schema Validation

- Server-side validation using Zod schemas
- Type inference for both client and server
- Detailed validation error messages
- Custom validation rules support

#### Form State Management

- Form data persistence between submissions
- Ability to reset form data after successful submission
- State management utilities for handling loading and error states

### Client-Side Features

#### Framework Agnostic

- Use React standard hook useActionState
- Works with any form management library of your choice
- Native support for React Hook Form, Formik, or plain HTML forms
- Zero client-side dependencies required

#### Native HTML Validation

- Automatic HTML5 validation attributes inferred from Zod schemas
- Client-side validation before server submission
- Improved user experience with instant feedback
- Accessibility-friendly validation messages

## Installation

```bash
npm install react-server-actions
```

## Basic Usage

### 1. Define your schema and action

Define your zod schema and create a server action. The server action must be wrapped into the `action` method to be sure that it will return a correct `ActionResult` type.

```typescript
import { z } from 'zod';
const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18),
});
```

```typescript
import { userSchema } from './schema';
import { action } from 'react-server-actions';
export const createUser = action(userSchema, async (data) => {
  // Your server logic here...
  // Then return whatever you want, also void. The action wrapper will wrap your response into an ActionResult object
  return { message: 'Cool!' };
});
```

### 2. Use in your form component

Connect the server action with the React hook `useStateAction`.
For having a correct initial data we provide a `initialState` method
After that you will have a typed `state` with all the informations about data submitted and validation state.

```typescript
'use client';
import { useActionState } from 'react';
import { createUser } from './action';
import { initialState } from 'react-server-actions';
export function UserForm() {
    const [state, action, pending] = useActionState(createUser, initialData({
        // can be an object that satisfies userSchema or undefined
        ...
    }));
    ...
}
```

### 3. Define the form

You can now create the form with native `<form>` or with any other library, taking advantage of having a structured and typed `state`.
This library will, anyway, provide two useful component:

- `<Form>` component - it will provide the ability to reset the form on successful submission, define a `onSuccess` and `onError` callback
- `<FormField>` component - it will provide a render method, which will expose a `field` property with the correct informations to build your inputs. **It will also inject the HTML5 validation rule based on the zod schema**!
  - Inside the `render` method of the `<FormField>` component you can use whatever ui library you want.
  - The `field` property will have this structure
    ```typescript
        {
            invalid: string[] | undefined;
            value: any;
            input: {
                id: string;
                name: string;
                'aria-invalid': boolean;
                autoComplete: 'on' | 'off' | undefined;
                defaultValue?: string;
                ...html5ValidationRules (like required, min, etc...)
            }
        }
    ```

```typescript
'use client';
import { useActionState } from 'react';
import { createUser } from './action'
export function UserForm() {
    const [state, action, pending] = useActionState(createUser);
    return (
        <Form state={state} action={action} schema={userSchema}>

            <FormField
                name="name"
                render={(field) => (
                    <div>
                        <label htmlFor={field.input.id} className={field.invalid ? 'text-red-500' : ''}>
                        Name
                        </label>
                        <input {...field.input} type="text" />
                        {field.invalid && <p className="text-red-500">{field.invalid}</p>}
                    </div>
                )}
            />

            <button type="submit" disabled={pending}>Save</button>
        </Form>
    );
}
```

## Advanced Features

### Custom Form Libraries Integration

The library works seamlessly with popular form management libraries:

** Docs still missing **

### Build your component around the library

** Docs still missing **

If you want to create your custom components around react-server-action library you can use the provided `useField` hook.

The `<Form>` and `<FormField>` components are providing a context in which you can call the `useField` for getting all the required information about a single field you need to build a component.

For example, we can recreate the standard Shadcn Form components in this way:

```typescript
"use client";

import { useField } from "@native-actions/client";
import React from "react";

export function FormLabel({ children }: { children: React.ReactNode }) {
  const field = useField();
  return (
    <label
      className={`text-sm font-medium leading-none ${field.invalid && "text-destructive"}`}
      htmlFor={field.input.id}
    >
      {children}
    </label>
  );
}

export function FormDescription({ children }: { children: React.ReactNode }) {
  const field = useField();
  return (
    <p
      id={field.input.id + "-description"}
      className="text-sm text-muted-foreground"
    >
      {children}
    </p>
  );
}

export function FormMessage({ children }: { children?: React.ReactNode }) {
  const field = useField();
  const error = field.invalid || children;
  if (!error) {
    return null;
  }
  return (
    <p
      id={field.input.id + "-message"}
      className={`text-sm font-medium ${error && "text-destructive"}`}
    >
      {error}
    </p>
  );
}
```

And them can use them inside the form for having a better developer experience

```typescript
export default function ShadcnForm() {
  const [state, action, pending] = useActionState(formAction, initialState(undefined));
  return (
        <Form state={state} action={action} schema={schema} className="space-y-4">
        <FormField
            name="name"
            render={(field) => (
                <div className="flex flex-col space-y-2">
                    <FormLabel>Name</FormLabel>
                    <FormDescription>Insert your name</FormDescription>
                    <Input {...field.input} />
                    <FormMessage />
                </div>
            )}
        />
        ...
        </Form>
    );
}
```

### Error Handling

In the `ActionResult` object there is an `error` property exposed. This property will be sent back only in case of an error during the action execution.
You can handle this error state in several ways

```typescript
'use client';
import { useActionState } from 'react';
import { createUser } from './action'
export function UserForm() {
    const [state, action, pending] = useActionState(createUser);
    useEffect(() => {
        // You can subscribe to state variable
        if (state.error) {
            console.log(state.error);
        }
    }, [state]);
    return (
        <Form state={state} action={action} schema={userSchema} onError={(err) => {
            // You can use the <Form> onError callback
            toast.error(err);
        }}>
            // You can render some component if state error is present
            {state.error && <p>An error occurred: {state.error}</p>}
            <FormField
                name="name"
                render={(field) => (
                    <div>
                        <label htmlFor={field.input.id} className={field.invalid ? 'text-red-500' : ''}>
                        Name
                        </label>
                        <input {...field.input} type="text" />
                        {field.invalid && <p className="text-red-500">{field.invalid}</p>}
                    </div>
                )}
            />

            <button type="submit" disabled={pending}>Save</button>
        </Form>
    );
}
```

## TypeScript Support

The library is written in TypeScript and provides full type safety:

- Automatic type inference from Zod schemas
- Type-safe action responses
- Proper error typing
- IDE autocompletion support

## Caveats

### datetime-local input type

In the standard html (as the time of writing) we have two kinds of date input

- `<input type="date">` which represent a yyyy-MM-dd date
- `<input type="datetime-local">` which represent a yyyy-MM-ddTHH:mm
  Since from a zod rule like `z.coerce.date()` we cannot know if the user is using a `<input type="date">` or `<input type="datetime-local">` we are, by default, assuming you are using a type="date" field.
  So, inside the `render` method of the `<FormField>` component, we are returning a yyyy-MM-dd formatted string inside the `field.input.defaultValue`

So this will work

```typescript
<FormField
    name="dateField"
    render={(field) => (
        <input {...field.input} type="date" />
    )}
/>
```

Instead for working with `datetime-local` inputs we are exposing a helper method to retrieve the defaultValue to assing to the input to be sure that we will not loose the field state across submits

```typescript
import { datetimeToInputDefaultValue } from 'react-server-actions';
...
<FormField
    name="dateField"
    render={(field) => (
        <input {...field.input} type="datetime-local" defaultValue={field.value ? datetimeToInputDefaultValue(field.value) : ''} />
    )}
/>
```

### select defaultValue

In react 19 there is an open issue https://github.com/facebook/react/issues/30580 that prevents the defaultValue to correctly set the select value.
According to this comment https://github.com/facebook/react/issues/30580#issuecomment-2537962675 there is a workaround by setting the 'key' attribute of the select.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

## License

MIT
