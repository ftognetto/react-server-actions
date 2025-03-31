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
  schema: z.ZodTypeAny,
  path: string[],
  options?: {
    inferTypeAttr?: boolean;
  },
): {
  type: 'string' | 'number' | 'date' | 'boolean' | 'enum';
  attrs: Record<string, string | number | boolean>;
} {
  const def = schema._def;
  let type: 'string' | 'number' | 'date' | 'boolean' | 'enum' = 'string';
  const attrs: Record<string, string | number | boolean> = {};

  // First handle object type to get to the actual field
  if (def.typeName === 'ZodObject' && path.length > 0) {
    const shape = def.shape();
    const field = shape[path[0] as keyof typeof shape];
    return field
      ? getZodValidationAttributes(field, path.slice(1), options)
      : { type, attrs };
  }

  // Now we're at the actual field, check if it's optional/nullable
  const isOptionalType = schema instanceof z.ZodOptional;
  const isNullableType = schema instanceof z.ZodNullable;

  // If it's an optional/nullable type, get attributes from the inner type but don't set required
  if (isOptionalType || isNullableType) {
    const innerAttrs = getZodValidationAttributes(def.innerType, path, options);
    delete innerAttrs.attrs.required;
    return innerAttrs;
  }

  // Set required by default for non-optional/nullable fields
  // Skip required attribute if the field has a default value
  if (!def.defaultValue) {
    attrs.required = true;
  }

  const typeName =
    def.typeName === 'ZodDefault'
      ? def.innerType._def.typeName
      : def.typeName === 'ZodCoerce'
        ? def.schema._def.typeName
        : def.typeName;

  if (typeName === 'ZodString') {
    type = 'string';
    attrs.type = 'text';
    const checks =
      def.typeName === 'ZodDefault' ? def.innerType._def.checks : def.checks;
    if (checks) {
      for (const check of checks) {
        if (check.kind === 'minlength' || check.kind === 'min') {
          attrs.minLength = check.value;
        }
        if (check.kind === 'maxlength' || check.kind === 'max') {
          attrs.maxLength = check.value;
        }
        if (check.kind === 'email') {
          attrs.type = 'email';
        }
        if (check.kind === 'url') {
          attrs.type = 'url';
        }
      }
    }
  } else if (typeName === 'ZodNumber') {
    type = 'number';
    attrs.type = 'number';
    const checks =
      def.typeName === 'ZodDefault'
        ? def.innerType._def.checks
        : def.typeName === 'ZodCoerce'
          ? def.schema._def.checks
          : def.checks;
    if (checks) {
      for (const check of checks) {
        if (check.kind === 'min') {
          attrs.min = check.value;
        }
        if (check.kind === 'max') {
          attrs.max = check.value;
        }
        if (check.kind === 'int') {
          attrs.step = 1;
        }
      }
    }
  } else if (typeName === 'ZodDate') {
    type = 'date';
    attrs.type = 'date';
    const checks =
      def.typeName === 'ZodDefault'
        ? def.innerType._def.checks
        : def.typeName === 'ZodCoerce'
          ? def.schema._def.checks
          : def.checks;
    if (checks) {
      for (const check of checks) {
        if (check.kind === 'min') {
          const minDate = new Date(check.value).toISOString().split('T')[0];
          if (minDate) {
            attrs.min = minDate;
          }
        }
        if (check.kind === 'max') {
          const maxDate = new Date(check.value).toISOString().split('T')[0];
          if (maxDate) {
            attrs.max = maxDate;
          }
        }
      }
    }
  } else if (typeName === 'ZodBoolean') {
    type = 'boolean';
    attrs.type = 'checkbox';
  } else if (typeName === 'ZodEnum') {
    type = 'enum';
    attrs.type = 'radio';
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
