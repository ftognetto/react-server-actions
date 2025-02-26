'use server';
import { schema } from '@/app/schema';
import { action, setInvalid } from 'react-server-actions';

// Wrap any action in the action function to validate data and make sure we are returning an [ActionResult] response
export const formAction = action(schema, async (data) => {
  console.log(data);
  if (data.name.indexOf('a') >= 0) {
    return setInvalid(data, 'name', 'Name cannot contain "a"');
  }
  // Simulate a slow operation
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Randomly return an error
  if (Math.random() > 0.5) {
    throw new Error('A randomly generated error occurred');
  }
  // Return anything we want. The action wrapper will handle the response and wrap it in an [ActionResult] response
  return {
    message: 'Form submitted successfully',
  };
});
