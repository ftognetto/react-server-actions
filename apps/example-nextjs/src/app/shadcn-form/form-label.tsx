import { Label } from '@/components/ui/label';
import { useField } from 'react-server-actions';

export function FormLabel({ children }: { children: React.ReactNode }) {
  const field = useField();
  return (
    <Label className={field.invalid && 'text-destructive'} htmlFor={field.input.id}>
      {children}
    </Label>
  );
}
