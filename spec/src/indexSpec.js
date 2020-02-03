'use strict';

const regexDescription = require('../../src');

describe('mongo-regex-description', () => {
  describe('create', () => {
    it('should work for "is"', () => {
      expect(regexDescription.create('is', 'a$value')).toEqual({
        $regex: '^a\\$value$',
        $options: 'i',
      });
    });

    it('should work for "is not"', () => {
      expect(regexDescription.create('is not', 'a$value')).toEqual({
        $not: { $regex: '^a\\$value$', $options: 'i' },
      });
    });

    it('should work for "contains"', () => {
      expect(regexDescription.create('contains', 'a$value')).toEqual({
        $regex: 'a\\$value',
        $options: 'i',
      });
    });

    it('should work for "does not contain"', () => {
      expect(regexDescription.create('does not contain', 'a$value')).toEqual({
        $not: { $regex: 'a\\$value', $options: 'i' },
      });
    });

    it('should work for "starts with"', () => {
      expect(regexDescription.create('starts with', 'a$value')).toEqual({
        $regex: '^a\\$value',
        $options: 'i',
      });
    });

    it('should work for "ends with"', () => {
      expect(regexDescription.create('ends with', 'a$value')).toEqual({
        $regex: 'a\\$value$',
        $options: 'i',
      });
    });

    it('should work for "is empty"', () => {
      expect(regexDescription.create('is empty')).toEqual({ $in: [null, ''] });
    });

    it('should work for "is not empty"', () => {
      expect(regexDescription.create('is not empty')).toEqual({ $exists: true, $nin: [null, ''] });
    });

    it('should handle escaping regexes', () => {
      expect(regexDescription.create('is', '|\\{}()[]^$+*?.')).toEqual({
        $regex: '^\\|\\\\\\{\\}\\(\\)\\[\\]\\^\\$\\+\\*\\?\\.$',
        $options: 'i',
      });
    });

    it('should throw on an unknown operator', () => {
      expect(() => regexDescription.create('bad operator', '')).toThrow();
    });
  });

  describe('empty values', () => {
    it('should work for "is"', () => {
      expect(regexDescription.parse(regexDescription.create('is', ''))).toEqual({
        operator: 'is',
        value: '',
      });
    });

    it('should work for "is not"', () => {
      expect(regexDescription.parse(regexDescription.create('is not', ''))).toEqual({
        operator: 'is not',
        value: '',
      });
    });

    it('should work for "contains"', () => {
      expect(regexDescription.parse(regexDescription.create('contains', ''))).toEqual({
        operator: 'contains',
        value: '',
      });
    });

    it('should work for "does not contain"', () => {
      expect(regexDescription.parse(regexDescription.create('does not contain', ''))).toEqual({
        operator: 'does not contain',
        value: '',
      });
    });

    it('should work for "starts with"', () => {
      expect(regexDescription.parse(regexDescription.create('starts with', ''))).toEqual({
        operator: 'starts with',
        value: '',
      });
    });

    it('should work for "ends with"', () => {
      expect(regexDescription.parse(regexDescription.create('ends with', ''))).toEqual({
        operator: 'ends with',
        value: '',
      });
    });
  });

  describe('parse', () => {
    it('should work for "is"', () => {
      expect(regexDescription.parse({ $regex: '^a\\$value$', $options: 'i' })).toEqual({
        operator: 'is',
        value: 'a$value',
      });
    });

    it('should work for "is not"', () => {
      expect(regexDescription.parse({ $not: { $regex: '^a\\$value$', $options: 'i' } })).toEqual({
        operator: 'is not',
        value: 'a$value',
      });
    });

    it('should work for "contains"', () => {
      expect(regexDescription.parse({ $regex: 'a\\$value', $options: 'i' })).toEqual({
        operator: 'contains',
        value: 'a$value',
      });
    });

    it('should work for "does not contain"', () => {
      expect(regexDescription.parse({ $not: { $regex: 'a\\$value', $options: 'i' } })).toEqual({
        operator: 'does not contain',
        value: 'a$value',
      });
    });

    it('should work for "starts with"', () => {
      expect(regexDescription.parse({ $regex: '^a\\$value', $options: 'i' })).toEqual({
        operator: 'starts with',
        value: 'a$value',
      });
    });

    it('should work for "ends with"', () => {
      expect(regexDescription.parse({ $regex: 'a\\$value$', $options: 'i' })).toEqual({
        operator: 'ends with',
        value: 'a$value',
      });
    });

    it('should work for "is empty"', () => {
      expect(regexDescription.parse({ $in: [null, ''] })).toEqual({
        operator: 'is empty',
      });
    });

    it('should work for "is not empty"', () => {
      expect(regexDescription.parse({ $exists: true, $nin: [null, ''] })).toEqual({
        operator: 'is not empty',
      });
    });

    describe('special cases', () => {
      it('should work for empty strings', () => {
        expect(regexDescription.parse({ $regex: '', $options: 'i' })).toEqual({
          operator: 'contains',
          value: '',
        });
      });

      it('should work for empty exact strings', () => {
        expect(regexDescription.parse({ $regex: '^$', $options: 'i' })).toEqual({
          operator: 'is',
          value: '',
        });
      });

      it('should work for strings that ends in a literal $', () => {
        expect(regexDescription.parse({ $regex: 'test\\$', $options: 'i' })).toEqual({
          operator: 'contains',
          value: 'test$',
        });
      });

      it('should work for strings is a literal $', () => {
        expect(regexDescription.parse({ $regex: '\\$', $options: 'i' })).toEqual({
          operator: 'contains',
          value: '$',
        });
      });

      it('should handle escaping regexes', () => {
        expect(
          regexDescription.parse({
            $regex: '^\\|\\\\\\{\\}\\(\\)\\[\\]\\^\\$\\+\\*\\?\\.$',
            $options: 'i',
          })
        ).toEqual({
          operator: 'is',
          value: '|\\{}()[]^$+*?.',
        });
      });

      it('should throw for a unhandled query', () => {
        expect(regexDescription.parse({})).toBeNull();
      });
    });
  });
});
