'use client';
import { formAction } from '@/app/actions';
import { schema } from '@/app/schema';
import { FormLabel } from '@/app/shadcn-form/form-label';
import { FormMessage } from '@/app/shadcn-form/form-message';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useActionState } from 'react';
import { datetimeToInputDefaultValue, Form, FormField, initialState } from 'react-server-actions';
export default function ShadcnForm() {
  const [state, action, pending] = useActionState(formAction, initialState(undefined));
  return (
    <Form state={state} action={action} schema={schema} className="space-y-4">
      <div className="space-y-2">
        <p className="text-lg font-bold">Shadcn Form</p>
        <p className="text-sm font-medium text-gray-700">
          This form is created using react-server-actions. Every input will automatically have HTML5 validation attributes and will be
          validated also on the server side. Also, the data will be mantained across submissions.
        </p>
      </div>
      <FormField
        name="name"
        render={(field) => (
          <div className="flex flex-col space-y-2">
            <FormLabel>Name</FormLabel>
            <Input {...field.input} />
            <FormMessage />
          </div>
        )}
      />
      <FormField
        name="email"
        render={(field) => (
          <div className="flex flex-col space-y-2">
            <FormLabel>Email</FormLabel>
            <Input {...field.input} type="email" />
            <FormMessage />
          </div>
        )}
      />
      <FormField
        name="password"
        render={(field) => (
          <div className="flex flex-col space-y-2">
            <FormLabel>Password</FormLabel>
            <Input {...field.input} type="password" />
            <FormMessage />
          </div>
        )}
      />
      <FormField
        name="birthDate"
        render={(field) => (
          <div className="flex flex-col space-y-2">
            <FormLabel>Birth Date</FormLabel>
            <Input {...field.input} type="date" />
            <FormMessage />
          </div>
        )}
      />
      <FormField
        name="birthDateTime"
        render={(field) => (
          <div className="flex flex-col space-y-2">
            <FormLabel>Birth Date</FormLabel>
            <Input
              {...field.input}
              type="datetime-local"
              // For <input type="datetime-local">, the default value is not in the form yyyy-MM-ddTHH:mm so we need to convert it
              defaultValue={field.value ? datetimeToInputDefaultValue(field.value) : ''}
            />
            <FormMessage />
          </div>
        )}
      />
      <FormField
        name="age"
        render={(field) => (
          <div className="flex flex-col space-y-2">
            <FormLabel>Age</FormLabel>
            <Input {...field.input} type="number" />
            <FormMessage />
          </div>
        )}
      />
      <FormField
        name="gender"
        render={(field) => (
          <div className="flex flex-col space-y-2">
            <RadioGroup {...field.input}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="r1" />
                <Label htmlFor="r1">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="r2" />
                <Label htmlFor="r2">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="r3" />
                <Label htmlFor="r3">Other</Label>
              </div>
            </RadioGroup>

            <FormMessage />
          </div>
        )}
      />
      <FormField
        name="preferredLanguage"
        render={(field) => (
          <div className="flex flex-col space-y-2">
            <FormLabel>Preferred Language</FormLabel>
            <Select {...field.input}>
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="it">Italian</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </div>
        )}
      />
      <FormField
        name="acceptTerms"
        render={(field) => (
          <div className="flex flex-col space-y-2">
            <FormLabel>Accept Terms</FormLabel>
            <Checkbox {...field.input} />
            <FormMessage />
          </div>
        )}
      />
      <FormField
        name="acceptOptional"
        render={(field) => (
          <div className="flex flex-col space-y-2">
            <FormLabel>Accept Optional Terms</FormLabel>
            <Checkbox {...field.input} defaultChecked={field.value} />
            <FormMessage />
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
