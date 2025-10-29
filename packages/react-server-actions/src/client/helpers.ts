import { z } from 'zod';

/**
 * Get the html5 validation attributes from a Zod schema field
 * @param schema - The Zod schema
 * @param path - The path to the field in the schema
 * @returns The validation attributes for the field
 * @note It would be cool to infer also the "type" attribute of the field, but this would not be consistent because a zod rule is not a 1-1 relation with an html input.
 *       For example, a zod.number() could be an <input type="number" /> but also a <select>. A z.date() could be represented by a <input type="date" /> but also a <input type="datetime-local" />.
 *       We could make a "guess" based on the zod rule, and then could be overriden by the user, but this would lead to confusion.
 *       So we leave it as a parameter for now.
 */
export function getZodValidationAttributes(
  schema: z.ZodType<any>,
  path: string[],
  options?: {
    inferTypeAttr?: boolean;
  },
): {
  type: 'string' | 'number' | 'date' | 'boolean' | 'enum' | 'file';
  attrs: Record<string, string | number | boolean>;
} {
  let type: 'string' | 'number' | 'date' | 'boolean' | 'enum' | 'file' =
    'string';
  const attrs: Record<string, string | number | boolean> = {};

  // First handle object type to get to the actual field
  if (schema instanceof z.ZodObject && path.length > 0) {
    const shape = schema.shape;
    const field = shape[path[0] as keyof typeof shape];
    return field
      ? getZodValidationAttributes(field, path.slice(1), options)
      : { type, attrs };
  }
  if (schema instanceof z.ZodTransform) {
    return getZodValidationAttributes((schema._def as any).in, path, options);
  }

  // Now we're at the actual field, check if it's optional/nullable
  const isOptionalType = schema instanceof z.ZodOptional;
  const isNullableType = schema instanceof z.ZodNullable;

  // If it's an optional/nullable type, get attributes from the inner type but don't set required
  if (isOptionalType || isNullableType) {
    const innerSchema = (schema as any)._def.innerType;
    const innerAttrs = getZodValidationAttributes(innerSchema, path, options);
    delete innerAttrs.attrs.required;
    return innerAttrs;
  }

  // Handle default values - if it's a ZodDefault, get the inner type and don't set required
  let actualSchema = schema;
  if (schema instanceof z.ZodDefault) {
    actualSchema = (schema as any)._def.innerType;
    // Don't set required for fields with default values
  } else {
    attrs.required = true;
  }

  // Check if it's a stringbool (ZodPipe with string in and boolean out)
  // This needs to be checked after unwrapping optional/default but before checking ZodString
  if (actualSchema instanceof z.ZodPipe) {
    const pipeDef = (actualSchema as any)._def;
    const inType = pipeDef.in?.type || pipeDef.in?._def?.type;
    const outType = pipeDef.out?.type || pipeDef.out?._def?.type;

    // If it's a string to boolean pipe, it's a stringbool
    if (inType === 'string' && outType === 'boolean') {
      type = 'boolean';
      attrs.type = 'checkbox';

      if (!options?.inferTypeAttr) {
        delete attrs.type;
      }

      return { type, attrs };
    }

    // Otherwise, unwrap and continue with inner type
    return getZodValidationAttributes(
      (actualSchema._def as any).in,
      path,
      options,
    );
  }

  if (actualSchema instanceof z.ZodString) {
    type = 'string';
    attrs.type = 'text';
    // Access checks through the schema's internal structure
    const checks = (actualSchema as any)._def?.checks;
    if (checks) {
      for (const check of checks) {
        const checkDef = check._zod?.def;
        if (checkDef) {
          if (checkDef.check === 'min_length') {
            attrs.minLength = checkDef.minimum;
          }
          if (checkDef.check === 'max_length') {
            attrs.maxLength = checkDef.maximum;
          }
          if (checkDef.format === 'email') {
            attrs.type = 'email';
          }
          if (checkDef.format === 'url') {
            attrs.type = 'url';
          }
        }
      }
    }
  } else if (actualSchema instanceof z.ZodNumber) {
    type = 'number';
    attrs.type = 'number';
    const checks = (actualSchema as any)._def?.checks;
    if (checks) {
      for (const check of checks) {
        const checkDef = check._zod?.def;
        if (checkDef) {
          if (checkDef.check === 'greater_than' && checkDef.inclusive) {
            attrs.min = checkDef.value;
          }
          if (checkDef.check === 'less_than' && checkDef.inclusive) {
            attrs.max = checkDef.value;
          }
          if (checkDef.check === 'greater_than' && !checkDef.inclusive) {
            attrs.min = checkDef.value + 1;
          }
          if (checkDef.check === 'less_than' && !checkDef.inclusive) {
            attrs.max = checkDef.value - 1;
          }
          if (checkDef.format === 'safeint') {
            attrs.step = 1;
          }
        }
      }
    }
  } else if (actualSchema instanceof z.ZodDate) {
    type = 'date';
    attrs.type = 'date';
    const checks = (actualSchema as any)._def?.checks;
    if (checks) {
      for (const check of checks) {
        const checkDef = check._zod?.def;
        if (checkDef) {
          if (checkDef.check === 'greater_than' && checkDef.inclusive) {
            const minDate = new Date(checkDef.value)
              .toISOString()
              .split('T')[0];
            if (minDate) {
              attrs.min = minDate;
            }
          }
          if (checkDef.check === 'less_than' && checkDef.inclusive) {
            const maxDate = new Date(checkDef.value)
              .toISOString()
              .split('T')[0];
            if (maxDate) {
              attrs.max = maxDate;
            }
          }
        }
      }
    }
  } else if (actualSchema instanceof z.ZodBoolean) {
    type = 'boolean';
    attrs.type = 'checkbox';
  } else if (actualSchema instanceof z.ZodEnum) {
    type = 'enum';
    attrs.type = 'radio';
  } else if (actualSchema instanceof z.ZodFile) {
    type = 'file';
    attrs.type = 'file';
  }

  // If not specified, remove the type attribute
  if (!options?.inferTypeAttr) {
    delete attrs.type;
  }

  return { type, attrs };
}

/**
 * Convert a date to an <input type="date"> default value
 * @param date - The date to convert
 * @returns The input default value
 */
export const dateToInputDefaultValue = (date: Date) => {
  const newDate = date ? new Date(date) : new Date();
  return new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];
};

/**
 * Convert a date to an <input type="datetime-local"> default value
 * @param date - The date to convert
 * @returns The input default value
 */
export const datetimeToInputDefaultValue = (date: Date) => {
  const newDate = date ? new Date(date) : new Date();
  return new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, -1);
};
