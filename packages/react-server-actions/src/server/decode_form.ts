import type { z } from 'zod';
import type { ConvertEmptyToValue, FieldErrors } from './types.js';

// ** Decode form helper
export const decodeFormData = (
  formData: FormData,
  convertEmptyTo: ConvertEmptyToValue,
): Record<string, any> => {
  const data: Record<string, any> = {};
  formData.forEach((value, key) => {
    // Reflect.has in favor of: object.hasOwnProperty(key)
    if (!Reflect.has(data, key)) {
      if (value && value.toString().length) {
        data[key] = value;
      } else {
        data[key] =
          convertEmptyTo === 'undefined'
            ? undefined
            : convertEmptyTo === 'null'
              ? null
              : convertEmptyTo === 'empty-string'
                ? ''
                : value;
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
const isPlainObject = (value: unknown): value is Record<string, any> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const flattenNestedFields = (
  value: Record<string, any>,
  prefix = '',
  acc: Record<string, any> = {},
) => {
  for (const [key, nestedValue] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(nestedValue)) {
      flattenNestedFields(nestedValue, path, acc);
      continue;
    }
    acc[path] = nestedValue;
  }
  return acc;
};

export const serializeFormData = <Schema extends z.ZodType<any>>(
  data: z.infer<Schema>,
) => {
  const serialized = JSON.parse(JSON.stringify(data));
  if (!isPlainObject(serialized)) {
    return serialized;
  }
  return flattenNestedFields(serialized);
};

const aggregateIssuesByPath = (
  issues: z.ZodIssue[],
): Record<string, string[]> => {
  const aggregated: Record<string, string[]> = {};

  for (const issue of issues) {
    if (!issue.path.length) {
      // Form-level issues do not have a path; skip until we have a place to store them.
      continue;
    }

    const key = issue.path.map(String).join('.');
    const message = issue.message ?? 'Invalid value';

    if (!aggregated[key]) {
      aggregated[key] = [];
    }

    aggregated[key].push(message);
  }

  return aggregated;
};

export const serializeInvalidResult = <Schema extends z.ZodType<any>>(
  error: z.ZodError<z.TypeOf<Schema>>,
): FieldErrors<Schema> => {
  const flattened = aggregateIssuesByPath(error.issues);
  return flattened as FieldErrors<Schema>;
};
