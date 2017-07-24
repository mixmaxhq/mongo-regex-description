'use strict';
/* globals describe, it, expect */
/* jshint -W030 */

const regexDescription = require('../../src');

describe('mongo-regex-description', () => {
  describe('create', () => {
    it('should work for "is"', () => {
      expect(regexDescription.create('is', 'a$value')).toEqual({ $regex: '^a\\$value$', $options: 'i' });
    });

    it('should work for "is not"', () => {
      expect(regexDescription.create('is not', 'a$value')).toEqual({ $not: { $regex: '^a\\$value$', $options: 'i' } });
    });

    it('should work for "is any of"', () => {
      expect(regexDescription.create('is any of', ['a$value', 'b$value'])).toEqual({ $or: [
        { $regex: '^a\\$value$', $options: 'i' },
        { $regex: '^b\\$value$', $options: 'i' }
        ]
      });
    });

    it(`should throw on an improperly structured 'is any of' query`, () => {
      expect(() => regexDescription.create('is any of', 'a$value')).toThrow();
    });

    it('should work for "contains"', () => {
      expect(regexDescription.create('contains', 'a$value')).toEqual({ $regex: 'a\\$value', $options: 'i' });
    });

    it('should work for "does not contain"', () => {
      expect(regexDescription.create('does not contain', 'a$value')).toEqual({ $not: { $regex: 'a\\$value', $options: 'i' } });
    });

    it('should work for "starts with"', () => {
      expect(regexDescription.create('starts with', 'a$value')).toEqual({ $regex: '^a\\$value', $options: 'i' });
    });

    it('should work for "ends with"', () => {
      expect(regexDescription.create('ends with', 'a$value')).toEqual({ $regex: 'a\\$value$', $options: 'i' });
    });

    it('should handle escaping regexes', () => {
      expect(regexDescription.create('is', '|\\{}()[]^$+*?.')).toEqual({ $regex: '^\\|\\\\\\{\\}\\(\\)\\[\\]\\^\\$\\+\\*\\?\\.$', $options: 'i' });
    });

    it('should throw on an unknown operator', () => {
      expect(() => regexDescription.create('bad operator', '')).toThrow();
    });
  });

  describe('parse', () => {
    it('should work for "is"', () => {
      expect(regexDescription.parse({ $regex: '^a\\$value$', $options: 'i' })).toEqual({
        operator: 'is',
        value: 'a$value'
      });
    });

    it('should work for "is not"', () => {
      expect(regexDescription.parse({ $not: { $regex: '^a\\$value$', $options: 'i' } })).toEqual({
        operator: 'is not',
        value: 'a$value'
      });
    });

    it('should work for "is any of"', () => {
      expect(regexDescription.parse({ $or: [
        { $regex: '^a\\$value$', $options: 'i' },
        { $regex: '^b\\$value$', $options: 'i' }
        ]
      })).toEqual({
        operator: 'is any of',
        value: ['a$value', 'b$value']
      });
    });

    it('should work for "contains"', () => {
      expect(regexDescription.parse({ $regex: 'a\\$value', $options: 'i' })).toEqual({
        operator: 'contains',
        value: 'a$value'
      });
    });

    it('should work for "does not contain"', () => {
      expect(regexDescription.parse({ $not: { $regex: 'a\\$value', $options: 'i' } })).toEqual({
        operator: 'does not contain',
        value: 'a$value'
      });
    });

    it('should work for "starts with"', () => {
      expect(regexDescription.parse({ $regex: '^a\\$value', $options: 'i' })).toEqual({
        operator: 'starts with',
        value: 'a$value'
      });
    });

    it('should work for "ends with"', () => {
      expect(regexDescription.parse({ $regex: 'a\\$value$', $options: 'i' })).toEqual({
        operator: 'ends with',
        value: 'a$value'
      });
    });

    describe('special cases', () => {
      it('should work for empty strings', () => {
        expect(regexDescription.parse({ $regex: '', $options: 'i' })).toEqual({
          operator: 'contains',
          value: ''
        });
      });

      it('should work for empty exact strings', () => {
        expect(regexDescription.parse({ $regex: '^$', $options: 'i' })).toEqual({
          operator: 'is',
          value: ''
        });
      });

      it('should work for strings that ends in a literal $', () => {
        expect(regexDescription.parse({ $regex: 'test\\$', $options: 'i' })).toEqual({
          operator: 'contains',
          value: 'test$'
        });
      });

      it('should work for strings is a literal $', () => {
        expect(regexDescription.parse({ $regex: '\\$', $options: 'i' })).toEqual({
          operator: 'contains',
          value: '$'
        });
      });

      it('should handle escaping regexes', () => {
        expect(regexDescription.parse({ $regex: '^\\|\\\\\\{\\}\\(\\)\\[\\]\\^\\$\\+\\*\\?\\.$', $options: 'i' })).toEqual({
          operator: 'is',
          value: '|\\{}()[]^$+*?.'
        });
      });

      it('should throw for a unhandled query', () => {
        expect(regexDescription.parse({})).toBeNull();
      });
    });
  });
});