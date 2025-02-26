import type { z } from 'zod';

// ** Decode form helper
export const decodeFormData = (formData: FormData): Record<string, any> => {
  const data: Record<string, any> = {};
  formData.forEach((value, key) => {
    // Reflect.has in favor of: object.hasOwnProperty(key)
    if (!Reflect.has(data, key)) {
      if (value && value.toString().length) {
        data[key] = value;
      } else {
        data[key] = undefined;
      }
      return;
    }
    // For grouped fields like multi-selects and checkboxes, we need to
    // store the values in an array.
    if (!Array.isArray(data[key])) {
      data[key] = [data[key]];
    }
    data[key].push(value);
  });

  // if in data there are fields with dot i assume that they are nested objects
  // and i transform them in nested objects
  for (const [key, value] of Object.entries(data)) {
    if (key.includes('.')) {
      const keys = key.split('.');
      const lastKey = keys.pop() as string;
      let obj = data;
      for (const k of keys) {
        if (!obj[k]) {
          obj[k] = {};
        }
        obj = obj[k];
      }
      obj[lastKey] = value;
      delete data[key];
    }
  }

  return data;
};
export const serialize = <Schema extends z.ZodTypeAny>(data: z.infer<Schema>) =>
  JSON.parse(JSON.stringify(data));
