'use client';
import { formAction } from '@/app/actions';
import { schema } from '@/app/schema';
import { useActionState } from 'react';
import { datetimeToInputDefaultValue, Form, FormField, initialState } from 'react-server-actions';
export default function ExampleForm() {
  const [state, action, pending] = useActionState(formAction, initialState(undefined));
  return (
    <Form state={state} action={action} schema={schema} className="space-y-4">
      <div className="space-y-2">
        <p className="text-lg font-bold">Form</p>
        <p className="text-sm font-medium text-gray-700">
          This form is created using react-server-actions. Every input will automatically have HTML5 validation attributes and will be
          validated also on the server side. Also, the data will be mantained across submissions.
        </p>
      </div>
      <FormField
        name="name"
        render={(field) => (
          <div className="flex flex-col space-y-2">
            <label htmlFor={field.input.id} className={`text-sm font-medium ${field.invalid ? 'text-red-500' : ''}`}>
              Name
            </label>
            <input {...field.input} className="border border-gray-300 rounded-md p-2 dark:text-gray-800" />
            {field.invalid && <p className="text-red-500">{field.invalid}</p>}
          </div>
        )}
      />
      <FormField
        name="email"
        render={(field) => (
          <div className="flex flex-col space-y-2">
            <label htmlFor={field.input.id} className={`text-sm font-medium ${field.invalid ? 'text-red-500' : ''}`}>
              Email
            </label>
            <input {...field.input} className="border border-gray-300 rounded-md p-2 dark:text-gray-800" />
            {field.invalid && <p className="text-red-500">{field.invalid}</p>}
          </div>
        )}
      />
      <FormField
        name="password"
        render={(field) => (
          <div className="flex flex-col space-y-2">
            <label htmlFor={field.input.id} className={`text-sm font-medium ${field.invalid ? 'text-red-500' : ''}`}>
              Password
            </label>
            <input {...field.input} className="border border-gray-300 rounded-md p-2 dark:text-gray-800" />
            {field.invalid && <p className="text-red-500">{field.invalid}</p>}
          </div>
        )}
      />
      <FormField
        name="birthDate"
        render={(field) => (
          <div className="flex flex-col space-y-2">
            <label htmlFor={field.input.id} className={`text-sm font-medium ${field.invalid ? 'text-red-500' : ''}`}>
              Birth Date
            </label>
            <input {...field.input} className="border border-gray-300 rounded-md p-2 dark:text-gray-800" />
            {field.invalid && <p className="text-red-500">{field.invalid}</p>}
          </div>
        )}
      />
      <FormField
        name="birthDateTime"
        render={(field) => (
          <div className="flex flex-col space-y-2">
            <label htmlFor={field.input.id} className={`text-sm font-medium ${field.invalid ? 'text-red-500' : ''}`}>
              Birth Date
            </label>
            <input
              {...field.input}
              type="datetime-local"
              defaultValue={field.value ? datetimeToInputDefaultValue(field.value) : ''}
              className="border border-gray-300 rounded-md p-2 dark:text-gray-800"
            />
            {field.invalid && <p className="text-red-500">{field.invalid}</p>}
          </div>
        )}
      />
      <FormField
        name="age"
        render={(field) => (
          <div className="flex flex-col space-y-2">
            <label htmlFor={field.input.id} className={`text-sm font-medium ${field.invalid ? 'text-red-500' : ''}`}>
              Age
            </label>
            <input {...field.input} className="border border-gray-300 rounded-md p-2 dark:text-gray-800" />
            {field.invalid && <p className="text-red-500">{field.invalid}</p>}
          </div>
        )}
      />
      <FormField
        name="acceptTerms"
        render={(field) => (
          <div className="flex flex-col space-y-2">
            <label htmlFor={field.input.id} className={`text-sm font-medium ${field.invalid ? 'text-red-500' : ''}`}>
              Accept Terms
            </label>
            <input {...field.input} className="border border-gray-300 rounded-md p-2 dark:text-gray-800" />
            {field.invalid && <p className="text-red-500">{field.invalid}</p>}
          </div>
        )}
      />
      {state.success && (
        <div className="space-y-2 border border-green-500 rounded-md p-2">
          <p className="text-green-500">Success response coming from server:</p>
          <p className="text-green-500">{JSON.stringify(state.successData)}</p>
        </div>
      )}
      {state.error && (
        <div className="space-y-2 border border-red-500 rounded-md p-2">
          <p className="text-red-500">Error response coming from server:</p>
          <p className="text-red-500">{state.error}</p>
        </div>
      )}
      {state.invalid && (
        <div className="space-y-2 border border-red-500 rounded-md p-2">
          <p className="text-red-500">Invalid field response coming from server:</p>
          <ul>
            {Object.entries(state.invalid).map(([key, value]) => (
              <li key={key}>
                <p>
                  {key}: {value}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button type="submit" disabled={pending} className="bg-blue-500 text-white px-4 py-2 rounded-md">
        Submit
      </button>
    </Form>
  );
}
