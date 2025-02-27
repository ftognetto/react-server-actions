import { useField } from 'react-server-actions';

export function FormDescription({ children }: { children: React.ReactNode }) {
  const field = useField();
  return (
    <p id={field.input.id + '-description'} className="text-sm text-muted-foreground">
      {children}
    </p>
  );
}
