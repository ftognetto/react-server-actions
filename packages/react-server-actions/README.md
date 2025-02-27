# React Server Actions

A lightweight library for handling server actions in React and Next.js applications using server side zod validation and native html client side validation.

## Intro

React Server Actions represent a groundbreaking advancement in how we handle server-side operations in React applications. However, while the APIs provided by the React team are powerful, developers often face challenges in establishing consistent patterns for handling responses, validation, and error management. This is where this library comes in.

React Server Actions was born out of the need to address these gaps in the implementation of React's new server actions feature. Rather than replacing the native functionality, this library builds upon it by providing a structured approach to server actions. The core idea is to establish a well-defined shape for server action responses, making them predictable and easier to work with.

```typescript
export const zodSchema = z.object({
    name: z.string().min(1),
    ...
})
```

```typescript
'use server';
export const someAction = action(zodSchema, async (data) => {
  // data is already validated and is typed
  // the action wrapper will take care of validate data and will wrap the response into a ActionResult type
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
  // Your server logic here
  return { success: true, data };
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

typescript
// With React Hook Form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
export function UserFormWithRHF() {
const form = useForm({
resolver: zodResolver(userSchema)
});
// ... rest of your form implementation
}

### Error Handling

typescript
'use client';
export function UserForm() {
const { action, isLoading, error } = useAction(createUser);
return (

<form action={action}>
{error && <div className="error">{error.message}</div>}
{/ form fields /}
</form>
);
}

## Caveats

### datetime-local input type

TODO: Explain how to use it

### select defaultValue

In react 19 there is an open issue https://github.com/facebook/react/issues/30580 that prevents the defaultValue to correctly set the select value.
According to this comment https://github.com/facebook/react/issues/30580#issuecomment-2537962675 there is a workaround by setting the 'key' attribute of the select

## Best Practices

1. Always define your schemas in a separate file for better reusability
2. Use type inference from your schemas for better type safety
3. Implement proper error handling both on client and server
4. Consider using progressive enhancement for better user experience
5. Follow accessibility guidelines when displaying validation messages

## TypeScript Support

The library is written in TypeScript and provides full type safety:

- Automatic type inference from Zod schemas
- Type-safe action responses
- Proper error typing
- IDE autocompletion support

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

## License

MIT
