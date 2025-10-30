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
            <input {...field.input} type="text" className="border border-gray-300 rounded-md p-2 dark:text-gray-800" />
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
            <input {...field.input} type="email" className="border border-gray-300 rounded-md p-2 dark:text-gray-800" />
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
            <input {...field.input} type="password" className="border border-gray-300 rounded-md p-2 dark:text-gray-800" />
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
            <input {...field.input} type="date" className="border border-gray-300 rounded-md p-2 dark:text-gray-800" />
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
              // For <input type="datetime-local">, the default value is not in the form yyyy-MM-ddTHH:mm so we need to convert it
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
            <input {...field.input} type="number" className="border border-gray-300 rounded-md p-2 dark:text-gray-800" />
            {field.invalid && <p className="text-red-500">{field.invalid}</p>}
          </div>
        )}
      />
      <FormField
        name="gender"
        render={(field) => (
          <div className="flex flex-col space-y-2">
            <label className={`text-sm font-medium ${field.invalid ? 'text-red-500' : ''}`}>Gender</label>
            <div className="flex items-center gap-2">
              <label htmlFor={field.input.id + '-male'} className={`text-sm font-medium ${field.invalid ? 'text-red-500' : ''}`}>
                Male
              </label>
              <input
                {...field.input}
                id={field.input.id + '-male'}
                // For <input type="radio">, the default value is not in the form value so we need to set it manually
                defaultChecked={field.value === 'male'}
                type="radio"
                defaultValue="male"
                className="border border-gray-300 rounded-md p-2 dark:text-gray-800"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor={field.input.id + '-female'} className={`text-sm font-medium ${field.invalid ? 'text-red-500' : ''}`}>
                Female
              </label>
              <input
                {...field.input}
                id={field.input.id + '-female'}
                // For <input type="radio">, the default value is not in the form value so we need to set it manually
                defaultChecked={field.value === 'female'}
                type="radio"
                defaultValue="female"
                className="border border-gray-300 rounded-md p-2 dark:text-gray-800"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor={field.input.id + '-other'} className={`text-sm font-medium ${field.invalid ? 'text-red-500' : ''}`}>
                Other
              </label>
              <input
                {...field.input}
                id={field.input.id + '-other'}
                // For <input type="radio">, the default value is not in the form value so we need to set it manually
                defaultChecked={field.value === 'other'}
                type="radio"
                defaultValue="other"
                className="border border-gray-300 rounded-md p-2 dark:text-gray-800"
              />
            </div>
            {field.invalid && <p className="text-red-500">{field.invalid}</p>}
          </div>
        )}
      />
      <FormField
        name="preferredLanguage"
        render={(field) => (
          <div className="flex flex-col space-y-2">
            <label htmlFor={field.input.id} className={`text-sm font-medium ${field.invalid ? 'text-red-500' : ''}`}>
              Preferred Language
            </label>
            <select {...field.input} key={field.input.defaultValue} className="border border-gray-300 rounded-md p-2 dark:text-gray-800">
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
              <option value="it">Italian</option>
            </select>
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
            <input {...field.input} type="checkbox" className="border border-gray-300 rounded-md p-2 dark:text-gray-800" />
            {field.invalid && <p className="text-red-500">{field.invalid}</p>}
          </div>
        )}
      />
      <FormField
        name="acceptOptional"
        render={(field) => (
          <div className="flex flex-col space-y-2">
            <label htmlFor={field.input.id} className={`text-sm font-medium ${field.invalid ? 'text-red-500' : ''}`}>
              Accept Optional Terms
            </label>
            <input {...field.input} type="checkbox" className="border border-gray-300 rounded-md p-2 dark:text-gray-800" />
            {field.invalid && <p className="text-red-500">{field.invalid}</p>}
          </div>
        )}
      />
      <FormField
        name="acceptStringBool"
        render={(field) => (
          <div className="flex flex-col space-y-2">
            <label htmlFor={field.input.id} className={`text-sm font-medium ${field.invalid ? 'text-red-500' : ''}`}>
              Accept with .stringbool()
            </label>
            <input {...field.input} type="checkbox" className="border border-gray-300 rounded-md p-2 dark:text-gray-800" />
            {field.invalid && <p className="text-red-500">{field.invalid}</p>}
          </div>
        )}
      />
      {state.success && (
        <div className="space-y-2 border border-green-500 rounded-md p-2">
          <p className="text-green-500">Success response coming from server:</p>
          <p className="text-green-500">{JSON.stringify(state.data)}</p>
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
