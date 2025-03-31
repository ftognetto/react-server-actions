import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { getZodValidationAttributes } from '../helpers.js';

describe('getZodValidationAttributes', () => {
  describe('String validation', () => {
    it('should handle basic string field', () => {
      const schema = z.object({ name: z.string() });
      const result = getZodValidationAttributes(schema, ['name']);
      expect(result).toEqual({
        type: 'string',
        attrs: { required: true },
      });
    });

    it('should handle string with min/max length', () => {
      const schema = z.object({
        username: z.string().min(3).max(20),
      });
      const result = getZodValidationAttributes(schema, ['username']);
      expect(result).toEqual({
        type: 'string',
        attrs: {
          required: true,
          minLength: 3,
          maxLength: 20,
        },
      });
    });

    it('should handle email validation with type inference', () => {
      const schema = z.object({
        email: z.string().email(),
      });
      const result = getZodValidationAttributes(schema, ['email'], {
        inferTypeAttr: true,
      });
      expect(result).toEqual({
        type: 'string',
        attrs: {
          required: true,
          type: 'email',
        },
      });
    });

    it('should handle URL validation with type inference', () => {
      const schema = z.object({
        website: z.string().url(),
      });
      const result = getZodValidationAttributes(schema, ['website'], {
        inferTypeAttr: true,
      });
      expect(result).toEqual({
        type: 'string',
        attrs: {
          required: true,
          type: 'url',
        },
      });
    });
  });

  describe('Number validation', () => {
    it('should handle basic number', () => {
      const schema = z.object({
        age: z.number(),
      });
      const result = getZodValidationAttributes(schema, ['age'], {
        inferTypeAttr: true,
      });
      expect(result).toEqual({
        type: 'number',
        attrs: {
          required: true,
          type: 'number',
        },
      });
    });

    it('should handle number with min/max/int', () => {
      const schema = z.object({
        rating: z.number().min(1).max(5).int(),
      });
      const result = getZodValidationAttributes(schema, ['rating'], {
        inferTypeAttr: true,
      });
      expect(result).toEqual({
        type: 'number',
        attrs: {
          required: true,
          type: 'number',
          min: 1,
          max: 5,
          step: 1,
        },
      });
    });

    it('should handle coerced number', () => {
      const schema = z.object({
        quantity: z.coerce.number().positive(),
      });
      const result = getZodValidationAttributes(schema, ['quantity'], {
        inferTypeAttr: true,
      });
      expect(result).toEqual({
        type: 'number',
        attrs: {
          required: true,
          type: 'number',
          min: 0,
        },
      });
    });
  });

  describe('Date validation', () => {
    it('should handle basic date', () => {
      const schema = z.object({
        birthdate: z.date(),
      });
      const result = getZodValidationAttributes(schema, ['birthdate'], {
        inferTypeAttr: true,
      });
      expect(result).toEqual({
        type: 'date',
        attrs: {
          required: true,
          type: 'date',
        },
      });
    });

    it('should handle date with min/max', () => {
      const minDate = new Date('2023-01-01');
      const maxDate = new Date('2023-12-31');
      const schema = z.object({
        eventDate: z.date().min(minDate).max(maxDate),
      });
      const result = getZodValidationAttributes(schema, ['eventDate'], {
        inferTypeAttr: true,
      });
      expect(result).toEqual({
        type: 'date',
        attrs: {
          required: true,
          type: 'date',
          min: '2023-01-01',
          max: '2023-12-31',
        },
      });
    });

    it('should handle coerced date', () => {
      const schema = z.object({
        timestamp: z.coerce.date(),
      });
      const result = getZodValidationAttributes(schema, ['timestamp'], {
        inferTypeAttr: true,
      });
      expect(result).toEqual({
        type: 'date',
        attrs: {
          required: true,
          type: 'date',
        },
      });
    });
  });

  describe('Boolean validation', () => {
    it('should handle boolean', () => {
      const schema = z.object({
        isActive: z.boolean(),
      });
      const result = getZodValidationAttributes(schema, ['isActive'], {
        inferTypeAttr: true,
      });
      expect(result).toEqual({
        type: 'boolean',
        attrs: {
          required: true,
          type: 'checkbox',
        },
      });
    });

    it('should handle coerced boolean', () => {
      const schema = z.object({
        subscribe: z.coerce.boolean(),
      });
      const result = getZodValidationAttributes(schema, ['subscribe'], {
        inferTypeAttr: true,
      });
      expect(result).toEqual({
        type: 'boolean',
        attrs: {
          required: true,
          type: 'checkbox',
        },
      });
    });

    it('should handle optional boolean', () => {
      const schema = z.object({
        subscribe: z.boolean().optional(),
      });
      const result = getZodValidationAttributes(schema, ['subscribe']);
      expect(result).toEqual({
        type: 'boolean',
        attrs: {},
      });
    });
  });

  describe('Enum validation', () => {
    it('should handle string enum', () => {
      const schema = z.object({
        role: z.enum(['admin', 'user', 'guest']),
      });
      const result = getZodValidationAttributes(schema, ['role'], {
        inferTypeAttr: true,
      });
      expect(result).toEqual({
        type: 'enum',
        attrs: {
          required: true,
          type: 'radio',
        },
      });
    });

    it('should handle coerced enum', () => {
      const schema = z.object({
        status: z.enum(['active', 'inactive']),
      });
      const result = getZodValidationAttributes(schema, ['status'], {
        inferTypeAttr: true,
      });
      expect(result).toEqual({
        type: 'enum',
        attrs: {
          required: true,
          type: 'radio',
        },
      });
    });
  });

  describe('Optional and nullable fields', () => {
    it('should handle optional string', () => {
      const schema = z.object({
        nickname: z.string().optional(),
      });
      const result = getZodValidationAttributes(schema, ['nickname']);
      expect(result).toEqual({
        type: 'string',
        attrs: {},
      });
    });

    it('should handle nullable number', () => {
      const schema = z.object({
        score: z.number().nullable(),
      });
      const result = getZodValidationAttributes(schema, ['score']);
      expect(result).toEqual({
        type: 'number',
        attrs: {},
      });
    });

    it('should handle optional and nullable date', () => {
      const schema = z.object({
        completedAt: z.date().optional().nullable(),
      });
      const result = getZodValidationAttributes(schema, ['completedAt']);
      expect(result).toEqual({
        type: 'date',
        attrs: {},
      });
    });
  });

  describe('Nested objects and arrays', () => {
    it('should handle nested object fields', () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            displayName: z.string().min(2),
          }),
        }),
      });
      const result = getZodValidationAttributes(schema, [
        'user',
        'profile',
        'displayName',
      ]);
      expect(result).toEqual({
        type: 'string',
        attrs: {
          required: true,
          minLength: 2,
        },
      });
    });

    it('should handle non-existent nested path', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
        }),
      });
      const result = getZodValidationAttributes(schema, [
        'user',
        'nonexistent',
        'field',
      ]);
      expect(result).toEqual({
        type: 'string',
        attrs: {},
      });
    });
  });

  describe('Type inference behavior', () => {
    it('should not include type attribute when inferTypeAttr is false', () => {
      const schema = z.object({
        email: z.string().email(),
      });
      const result = getZodValidationAttributes(schema, ['email'], {
        inferTypeAttr: false,
      });
      expect(result).toEqual({
        type: 'string',
        attrs: {
          required: true,
        },
      });
    });

    it('should not include type attribute by default', () => {
      const schema = z.object({
        url: z.string().url(),
      });
      const result = getZodValidationAttributes(schema, ['url']);
      expect(result).toEqual({
        type: 'string',
        attrs: {
          required: true,
        },
      });
    });
  });

  describe('Fields with default values', () => {
    it('should not mark string with default as required', () => {
      const schema = z.object({
        name: z.string().default('Anonymous'),
      });
      const result = getZodValidationAttributes(schema, ['name']);
      expect(result).toEqual({
        type: 'string',
        attrs: {},
      });
    });

    it('should not mark number with default as required', () => {
      const schema = z.object({
        count: z.number().default(0),
      });
      const result = getZodValidationAttributes(schema, ['count'], {
        inferTypeAttr: true,
      });
      expect(result).toEqual({
        type: 'number',
        attrs: {
          type: 'number',
        },
      });
    });

    it('should not mark boolean with default as required', () => {
      const schema = z.object({
        isEnabled: z.boolean().default(false),
      });
      const result = getZodValidationAttributes(schema, ['isEnabled'], {
        inferTypeAttr: true,
      });
      expect(result).toEqual({
        type: 'boolean',
        attrs: {
          type: 'checkbox',
        },
      });
    });

    it('should handle default value with other validations', () => {
      const schema = z.object({
        age: z.number().min(0).max(120).default(18),
      });
      const result = getZodValidationAttributes(schema, ['age'], {
        inferTypeAttr: true,
      });
      expect(result).toEqual({
        type: 'number',
        attrs: {
          type: 'number',
          min: 0,
          max: 120,
        },
      });
    });

    it('should handle string with default and validation', () => {
      const schema = z.object({
        username: z.string().min(3).max(20).default('user123'),
      });
      const result = getZodValidationAttributes(schema, ['username']);
      expect(result).toEqual({
        type: 'string',
        attrs: {
          minLength: 3,
          maxLength: 20,
        },
      });
    });

    it('should handle date with default and validation', () => {
      const minDate = new Date('2023-01-01');
      const maxDate = new Date('2023-12-31');
      const schema = z.object({
        eventDate: z
          .date()
          .min(minDate)
          .max(maxDate)
          .default(new Date('2023-06-15')),
      });
      const result = getZodValidationAttributes(schema, ['eventDate'], {
        inferTypeAttr: true,
      });
      expect(result).toEqual({
        type: 'date',
        attrs: {
          type: 'date',
          min: '2023-01-01',
          max: '2023-12-31',
        },
      });
    });

    it('should handle enum with default', () => {
      const schema = z.object({
        role: z.enum(['admin', 'user', 'guest']).default('user'),
      });
      const result = getZodValidationAttributes(schema, ['role'], {
        inferTypeAttr: true,
      });
      expect(result).toEqual({
        type: 'enum',
        attrs: {
          type: 'radio',
        },
      });
    });
  });
});
