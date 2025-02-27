# Next Native Actions

A lightweight library for handling form actions in Next.js applications using native browser capabilities and server actions.

## Features

### Server-Side Features

#### Direct React Server Actions Integration

- Seamlessly works with Next.js and React Server Actions
- No additional server-side middleware required
- Type-safe action handling

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

- Optional form data persistence between submissions
- Ability to reset form data after successful submission
- State management utilities for handling loading and error states

### Client-Side Features

#### Framework Agnostic

- Works with any form management library of your choice
- Native support for React Hook Form, Formik, or plain HTML forms
- Zero client-side dependencies required

#### Native HTML Validation

- Automatic HTML5 validation attributes from Zod schemas
- Client-side validation before server submission
- Improved user experience with instant feedback
- Accessibility-friendly validation messages

## Installation

bash
npm install next-native-actions

## Basic Usage

### 1. Define your schema and action

typescript:next-native-actions/README.md
import { z } from 'zod';
import { createAction } from 'next-native-actions';
const userSchema = z.object({
name: z.string().min(2),
email: z.string().email(),
age: z.number().min(18)
});
export const createUser = createAction(userSchema, async (data) => {
// Your server logic here
return { success: true, data };
});

### 2. Use in your form component

typescript
'use client';
import { useAction } from 'next-native-actions/client';
export function UserForm() {
const { action, isLoading } = useAction(createUser);
return (

<form action={action}>
<input name="name" type="text" required minLength={2} />
<input name="email" type="email" required />
<input name="age" type="number" required min={18} />
<button disabled={isLoading}>Submit</button>
</form>
);
}

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
