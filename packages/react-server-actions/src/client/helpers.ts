import { z } from 'zod';

export function getZodValidationAttributes(
  schema: z.ZodTypeAny,
  path: string[],
): Record<string, string | number | boolean> {
  const def = schema._def;
  const attrs: Record<string, string | number | boolean> = {};

  // First handle object type to get to the actual field
  if (def.typeName === 'ZodObject' && path.length > 0) {
    const shape = def.shape();
    const field = shape[path[0] as keyof typeof shape];
    return field ? getZodValidationAttributes(field, path.slice(1)) : {};
  }

  // Now we're at the actual field, check if it's optional/nullable
  const isOptionalType = schema instanceof z.ZodOptional;
  const isNullableType = schema instanceof z.ZodNullable;

  // If it's an optional/nullable type, get attributes from the inner type but don't set required
  if (isOptionalType || isNullableType) {
    const innerAttrs = getZodValidationAttributes(def.innerType, path);
    delete innerAttrs.required;
    return innerAttrs;
  }

  // Set required by default for non-optional/nullable fields
  attrs.required = true;

  if (def.typeName === 'ZodString') {
    attrs.type = 'text';
    if (def.checks) {
      for (const check of def.checks) {
        if (check.kind === 'min') {
          attrs.minLength = check.value;
        }
        if (check.kind === 'max') {
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
  }

  if (
    def.typeName === 'ZodNumber' ||
    (def.typeName === 'ZodCoerce' && def.schema._def.typeName === 'ZodNumber')
  ) {
    attrs.type = 'number';
    if (def.checks || (def.schema && def.schema._def.checks)) {
      const checks = def.checks || def.schema._def.checks;
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
  }

  if (
    def.typeName === 'ZodDate' ||
    (def.typeName === 'ZodCoerce' && def.schema._def.typeName === 'ZodDate')
  ) {
    attrs.type = 'date';
    if (def.checks || (def.schema && def.schema._def.checks)) {
      const checks = def.checks || def.schema._def.checks;
      for (const check of checks) {
        if (check.kind === 'min') {
          attrs.min = check.value.toISOString().split('T')[0];
        }
        if (check.kind === 'max') {
          attrs.max = check.value.toISOString().split('T')[0];
        }
      }
    }
  }

  if (
    def.typeName === 'ZodBoolean' ||
    (def.typeName === 'ZodCoerce' && def.schema._def.typeName === 'ZodBoolean')
  ) {
    attrs.type = 'checkbox';
  }

  return attrs;
}

export const dateToInputDefaultValue = (date: Date) => {
  const newDate = date ? new Date(date) : new Date();
  return new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];
};
export const datetimeToInputDefaultValue = (date: Date) => {
  const newDate = date ? new Date(date) : new Date();
  return new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, -1);
};
