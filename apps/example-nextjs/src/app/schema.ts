import { z } from 'zod';

export const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  birthDate: z.coerce.date(),
  birthDateTime: z.coerce.date(),
  age: z.coerce.number().min(18),
  acceptTerms: z.coerce.boolean(),
  gender: z.enum(['male', 'female', 'other']),
});
