import { describe, expect, it } from 'vitest';
import z from 'zod';
import {
  decodeFormData,
  serializeFormData,
  serializeInvalidResult,
} from '../decode_form.js';

describe('decodeFormData', () => {
  describe('Basic form data decoding', () => {
    it('should decode simple form data with string values', () => {
      const formData = new FormData();
      formData.append('name', 'John');
      formData.append('email', 'john@example.com');

      const result = decodeFormData(formData, 'undefined');
      expect(result).toEqual({
        name: 'John',
        email: 'john@example.com',
      });
    });

    it('should decode form data with number values', () => {
      const formData = new FormData();
      formData.append('age', '25');
      formData.append('score', '100');

      const result = decodeFormData(formData, 'undefined');
      expect(result).toEqual({
        age: '25',
        score: '100',
      });
    });

    it('should decode form data with boolean values', () => {
      const formData = new FormData();
      formData.append('isActive', 'true');
      formData.append('isPublic', 'false');

      const result = decodeFormData(formData, 'undefined');
      expect(result).toEqual({
        isActive: 'true',
        isPublic: 'false',
      });
    });
  });

  describe('Empty value handling', () => {
    it('should convert empty values to undefined when convertEmptyTo is "undefined"', () => {
      const formData = new FormData();
      formData.append('name', 'John');
      formData.append('emptyField', '');

      const result = decodeFormData(formData, 'undefined');
      expect(result).toEqual({
        name: 'John',
        emptyField: undefined,
      });
    });

    it('should convert empty values to null when convertEmptyTo is "null"', () => {
      const formData = new FormData();
      formData.append('name', 'John');
      formData.append('emptyField', '');

      const result = decodeFormData(formData, 'null');
      expect(result).toEqual({
        name: 'John',
        emptyField: null,
      });
    });

    it('should convert empty values to empty string when convertEmptyTo is "empty-string"', () => {
      const formData = new FormData();
      formData.append('name', 'John');
      formData.append('emptyField', '');

      const result = decodeFormData(formData, 'empty-string');
      expect(result).toEqual({
        name: 'John',
        emptyField: '',
      });
    });

    it('should handle empty file inputs', () => {
      const formData = new FormData();
      formData.append('name', 'John');
      const emptyFile = new File([], '');
      formData.append('file', emptyFile);

      const result = decodeFormData(formData, 'undefined');
      // Empty files are still File objects, so they're preserved
      expect(result.name).toBe('John');
      expect(result.file).toBeInstanceOf(File);
      expect(result.file.name).toBe('');
      expect(result.file.size).toBe(0);
    });
  });

  describe('Grouped fields (arrays)', () => {
    it('should convert multiple values with same key into an array', () => {
      const formData = new FormData();
      formData.append('hobby', 'reading');
      formData.append('hobby', 'swimming');
      formData.append('hobby', 'coding');

      const result = decodeFormData(formData, 'undefined');
      expect(result).toEqual({
        hobby: ['reading', 'swimming', 'coding'],
      });
    });

    it('should handle single value that becomes array when duplicate key is added', () => {
      const formData = new FormData();
      formData.append('tag', 'javascript');
      formData.append('tag', 'typescript');

      const result = decodeFormData(formData, 'undefined');
      expect(result).toEqual({
        tag: ['javascript', 'typescript'],
      });
    });

    it('should handle mixed single and multiple values', () => {
      const formData = new FormData();
      formData.append('name', 'John');
      formData.append('tag', 'javascript');
      formData.append('tag', 'typescript');
      formData.append('email', 'john@example.com');

      const result = decodeFormData(formData, 'undefined');
      expect(result).toEqual({
        name: 'John',
        tag: ['javascript', 'typescript'],
        email: 'john@example.com',
      });
    });
  });

  describe('Nested objects (dot notation)', () => {
    it('should convert dot-notation keys into nested objects', () => {
      const formData = new FormData();
      formData.append('user.name', 'John');
      formData.append('user.email', 'john@example.com');
      formData.append('user.age', '25');

      const result = decodeFormData(formData, 'undefined');
      expect(result).toEqual({
        user: {
          name: 'John',
          email: 'john@example.com',
          age: '25',
        },
      });
    });

    it('should handle deeply nested objects', () => {
      const formData = new FormData();
      formData.append('user.profile.name', 'John');
      formData.append('user.profile.email', 'john@example.com');
      formData.append('user.settings.theme', 'dark');

      const result = decodeFormData(formData, 'undefined');
      expect(result).toEqual({
        user: {
          profile: {
            name: 'John',
            email: 'john@example.com',
          },
          settings: {
            theme: 'dark',
          },
        },
      });
    });

    it('should handle mixed flat and nested fields', () => {
      const formData = new FormData();
      formData.append('name', 'John');
      formData.append('user.email', 'john@example.com');
      formData.append('age', '25');

      const result = decodeFormData(formData, 'undefined');
      expect(result).toEqual({
        name: 'John',
        user: {
          email: 'john@example.com',
        },
        age: '25',
      });
    });

    it('should handle nested objects with arrays', () => {
      const formData = new FormData();
      formData.append('user.name', 'John');
      formData.append('user.tags', 'javascript');
      formData.append('user.tags', 'typescript');

      const result = decodeFormData(formData, 'undefined');
      expect(result).toEqual({
        user: {
          name: 'John',
          tags: ['javascript', 'typescript'],
        },
      });
    });

    it('should handle multiple nested objects at same level', () => {
      const formData = new FormData();
      formData.append('user.name', 'John');
      formData.append('user.email', 'john@example.com');
      formData.append('address.street', '123 Main St');
      formData.append('address.city', 'New York');

      const result = decodeFormData(formData, 'undefined');
      expect(result).toEqual({
        user: {
          name: 'John',
          email: 'john@example.com',
        },
        address: {
          street: '123 Main St',
          city: 'New York',
        },
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty form data', () => {
      const formData = new FormData();
      const result = decodeFormData(formData, 'undefined');
      expect(result).toEqual({});
    });

    it('should handle form data with only empty values', () => {
      const formData = new FormData();
      formData.append('field1', '');
      formData.append('field2', '');

      const result = decodeFormData(formData, 'null');
      expect(result).toEqual({
        field1: null,
        field2: null,
      });
    });

    it('should handle keys with multiple consecutive dots', () => {
      const formData = new FormData();
      formData.append('a.b.c', 'value');

      const result = decodeFormData(formData, 'undefined');
      expect(result).toEqual({
        a: {
          b: {
            c: 'value',
          },
        },
      });
    });

    it('should handle keys starting or ending with dots', () => {
      const formData = new FormData();
      formData.append('.field', 'value');
      formData.append('field.', 'value2');

      const result = decodeFormData(formData, 'undefined');
      // Keys starting with dots create nested objects with empty string key
      // Keys ending with dots create nested objects with empty string property
      expect(result).toHaveProperty('');
      expect(result['']).toEqual({ field: 'value' });
      expect(result).toHaveProperty('field');
      expect(result.field).toEqual({ '': 'value2' });
    });

    it('should preserve original value when convertEmptyTo is not a recognized option', () => {
      const formData = new FormData();
      formData.append('name', 'John');
      formData.append('emptyField', '');

      // @ts-expect-error - testing invalid convertEmptyTo value
      const result = decodeFormData(formData, 'invalid');
      expect(result).toEqual({
        name: 'John',
        emptyField: '',
      });
    });

    it('should handle File objects', () => {
      const formData = new FormData();
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      formData.append('file', file);
      formData.append('name', 'John');

      const result = decodeFormData(formData, 'undefined');
      expect(result.name).toBe('John');
      expect(result.file).toBeInstanceOf(File);
      expect(result.file.name).toBe('test.txt');
    });

    it('should handle Blob objects', () => {
      const formData = new FormData();
      const blob = new Blob(['content'], { type: 'text/plain' });
      formData.append('blob', blob);
      formData.append('name', 'John');

      const result = decodeFormData(formData, 'undefined');
      expect(result.name).toBe('John');
      expect(result.blob).toBeInstanceOf(Blob);
    });
  });

  describe('Complex scenarios', () => {
    it('should handle form data with all features combined', () => {
      const formData = new FormData();
      formData.append('name', 'John');
      formData.append('user.profile.name', 'John Doe');
      formData.append('user.profile.email', 'john@example.com');
      formData.append('tags', 'javascript');
      formData.append('tags', 'typescript');
      formData.append('emptyField', '');
      formData.append('settings.theme', 'dark');
      formData.append('settings.notifications', 'true');

      const result = decodeFormData(formData, 'null');
      expect(result).toEqual({
        name: 'John',
        user: {
          profile: {
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
        tags: ['javascript', 'typescript'],
        emptyField: null,
        settings: {
          theme: 'dark',
          notifications: 'true',
        },
      });
    });
  });
});

describe('serializeFormData', () => {
  it('should serialize simple object', () => {
    const data = { name: 'John', age: 25 };
    const result = serializeFormData(data);
    expect(result).toEqual({ name: 'John', age: 25 });
  });

  it('should serialize object with dates', () => {
    const date = new Date('2023-01-01');
    const data = { name: 'John', createdAt: date };
    const result = serializeFormData(data);
    expect(result).toEqual({
      name: 'John',
      createdAt: date.toISOString(),
    });
  });

  it('should serialize nested objects', () => {
    const data = {
      user: {
        name: 'John',
        profile: {
          email: 'john@example.com',
        },
      },
    };
    const result = serializeFormData(data);
    expect(result).toEqual({
      'user.name': 'John',
      'user.profile.email': 'john@example.com',
    });
  });

  it('should flatten deeply nested structures while keeping arrays intact', () => {
    const data = {
      user: {
        profile: {
          name: 'Jane',
          address: {
            city: 'NYC',
          },
        },
        tags: ['admin', 'editor'],
      },
      preferences: {
        theme: 'dark',
      },
    };

    const result = serializeFormData(data);
    expect(result).toEqual({
      'user.profile.name': 'Jane',
      'user.profile.address.city': 'NYC',
      'preferences.theme': 'dark',
      'user.tags': ['admin', 'editor'],
    });
  });

  it('should serialize arrays', () => {
    const data = { tags: ['javascript', 'typescript', 'react'] };
    const result = serializeFormData(data);
    expect(result).toEqual({ tags: ['javascript', 'typescript', 'react'] });
  });

  it('should serialize arrays with objects', () => {
    const data = {
      users: [
        { name: 'John', age: 25 },
        { name: 'Jane', age: 30 },
      ],
    };
    const result = serializeFormData(data);
    expect(result).toEqual({
      users: [
        { name: 'John', age: 25 },
        { name: 'Jane', age: 30 },
      ],
    });
  });

  it('should serialize null and undefined values', () => {
    const data = { name: 'John', email: null, phone: undefined };
    const result = serializeFormData(data);
    expect(result).toEqual({
      name: 'John',
      email: null,
      // undefined values are removed by JSON.stringify
    });
    expect('phone' in result).toBe(false);
  });

  it('should serialize boolean values', () => {
    const data = { isActive: true, isPublic: false };
    const result = serializeFormData(data);
    expect(result).toEqual({ isActive: true, isPublic: false });
  });

  it('should serialize number values', () => {
    const data = { age: 25, score: 100.5, count: 0 };
    const result = serializeFormData(data);
    expect(result).toEqual({ age: 25, score: 100.5, count: 0 });
  });

  it('should remove functions and non-serializable values', () => {
    const data = {
      name: 'John',
      fn: () => 'test',
      symbol: Symbol('test'),
    };
    const result = serializeFormData(data as any);
    expect(result).toEqual({ name: 'John' });
    expect('fn' in result).toBe(false);
    expect('symbol' in result).toBe(false);
  });

  it('should handle empty objects and arrays', () => {
    const data = { emptyObj: {}, emptyArr: [] };
    const result = serializeFormData(data);
    expect(result).toEqual({ emptyArr: [] });
  });

  it('should serialize complex nested structure', () => {
    const date = new Date('2023-01-01');
    const data = {
      user: {
        name: 'John',
        createdAt: date,
        tags: ['admin', 'user'],
        settings: {
          theme: 'dark',
          notifications: true,
        },
      },
      posts: [
        { title: 'Post 1', published: true },
        { title: 'Post 2', published: false },
      ],
    };
    const result = serializeFormData(data);
    expect(result).toEqual({
      'user.name': 'John',
      'user.createdAt': date.toISOString(),
      'user.settings.theme': 'dark',
      'user.settings.notifications': true,
      'user.tags': ['admin', 'user'],
      posts: [
        { title: 'Post 1', published: true },
        { title: 'Post 2', published: false },
      ],
    });
  });
});

describe('serializeInvalidResult', () => {
  it('should surface simple field errors', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number().min(18),
    });

    const invalidData = {
      age: 15,
    };

    const result = schema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success) {
      const flattened = serializeInvalidResult<typeof schema>(result.error);
      expect(flattened).toMatchObject({
        name: ['Invalid input: expected string, received undefined'],
        age: ['Too small: expected number to be >=18'],
      });
    }
  });

  it('should collect multiple issues for the same field', () => {
    const schema = z.object({
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .regex(/[A-Z]/, 'Password must include an uppercase letter'),
    });

    const invalidData = {
      password: 'short',
    };

    const result = schema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success) {
      const flattened = serializeInvalidResult<typeof schema>(result.error);
      expect(flattened.password).toEqual([
        'Password must be at least 8 characters long',
        'Password must include an uppercase letter',
      ]);
    }
  });

  it('should ignore fields that validate successfully', () => {
    const schema = z.object({
      email: z.string().email(),
      username: z.string().min(3),
    });

    const invalidData = {
      email: 'not-an-email',
      username: 'validUser',
    };

    const result = schema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success) {
      const flattened = serializeInvalidResult<typeof schema>(result.error);
      expect(flattened).toHaveProperty('email');
      expect(flattened).not.toHaveProperty('username');
    }
  });

  it('should flatten nested errors with dot notation using serializeInvalidResult', () => {
    const schema = z.object({
      property: z.string(),
      nested: z.object({
        nestedproperty: z.string(),
      }),
    });

    const invalidData = {
      property: 'test',
      nested: {},
    };

    const result = schema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success) {
      const flattened = serializeInvalidResult<typeof schema>(result.error);
      expect(flattened).toEqual({
        'nested.nestedproperty': [
          'Invalid input: expected string, received undefined',
        ],
      });
    }
  });

  it('should work for normal fields when there is nested fields', () => {
    const schema = z.object({
      property: z.string(),
      nested: z.object({
        nestedproperty: z.string(),
      }),
    });

    const invalidData = {
      property: undefined,
      nested: {
        nestedproperty: 'test',
      },
    };

    const result = schema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success) {
      const flattened = serializeInvalidResult<typeof schema>(result.error);
      expect(flattened).toEqual({
        property: ['Invalid input: expected string, received undefined'],
      });
    }
  });

  it('should flatten deeply nested errors with dot notation', () => {
    const schema = z.object({
      user: z.object({
        profile: z.object({
          email: z.string().email(),
          name: z.string().min(2),
        }),
      }),
    });

    const invalidData = {
      user: {
        profile: {
          email: 'invalid-email',
          name: 'A',
        },
      },
    };

    const result = schema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success) {
      const flattened = serializeInvalidResult<typeof schema>(result.error);
      expect(flattened).toHaveProperty('user.profile.email');
      expect(flattened).toHaveProperty('user.profile.name');
      expect(Array.isArray(flattened['user.profile.email'])).toBe(true);
      expect(Array.isArray(flattened['user.profile.name'])).toBe(true);
    }
  });
});
