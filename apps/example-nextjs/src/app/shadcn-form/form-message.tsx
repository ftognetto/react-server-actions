import { useField } from 'react-server-actions';

export function FormMessage({ children }: { children?: React.ReactNode }) {
  const field = useField();
  const error = field.invalid || children;
  if (!error) {
    return null;
  }
  return (
    <p id={field.input.id + '-message'} className={`text-sm font-medium ${error && 'text-destructive'}`}>
      {error}
    </p>
  );
}
