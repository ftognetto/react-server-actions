import { z } from 'zod';

export const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  birthDate: z.coerce.date(),
  birthDateTime: z.coerce.date(),
  age: z.coerce.number().min(18),
  gender: z.enum(['male', 'female', 'other']),
  preferredLanguage: z.enum(['en', 'fr', 'es', 'it']),
  acceptTerms: z.coerce.boolean(),
  acceptOptional: z.coerce.boolean().optional(),
});
