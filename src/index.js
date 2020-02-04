const supportedOperators = [
  'contains',
  'does not contain',
  'is',
  'is not',
  'is empty',
  'is not empty',
  'starts with',
  'ends with',
];

// { $in: [null, ''] }
function isIsEmptyQuery(query) {
  const keys = Object.keys(query);
  if (keys.length !== 1) {
    return false;
  }
  const inValues = query.$in;
  return (
    Array.isArray(inValues) &&
    inValues.length === 2 &&
    inValues.indexOf(null) >= 0 &&
    inValues.indexOf('') >= 0
  );
}

// { $exists: true, $nin: [null, ''] }
function isIsNotEmptyQuery(query) {
  const keys = Object.keys(query);
  if (keys.length !== 2 || !query.$exists) {
    return false;
  }
  const ninValues = query.$nin;
  return (
    Array.isArray(ninValues) &&
    ninValues.length === 2 &&
    ninValues.indexOf(null) >= 0 &&
    ninValues.indexOf('') >= 0
  );
}

/**
 * Returns a Mongo query that can be used a value for a field, given an operator and a value.
 * See readme for supported values.
 */
function create(operator, value) {
  if (supportedOperators.includes(operator)) {
    switch (operator) {
      case 'is':
        // Assume case-insensitive
        return {
          $regex: `^${escapeRegex(value)}$`,
          $options: 'i',
        };
      case 'is not':
        // Assume case-insensitive
        return {
          $not: {
            $regex: `^${escapeRegex(value)}$`,
            $options: 'i',
          },
        };
      case 'contains':
        return {
          $regex: escapeRegex(value),
          $options: 'i',
        };
      case 'does not contain':
        return {
          $not: {
            $regex: escapeRegex(value),
            $options: 'i',
          },
        };
      case 'starts with':
        return {
          $regex: `^${escapeRegex(value)}`,
          $options: 'i',
        };
      case 'ends with':
        return {
          $regex: `${escapeRegex(value)}$`,
          $options: 'i',
        };
      case 'is empty':
        return {
          $in: [null, ''],
        };
      case 'is not empty':
        return {
          $exists: true,
          $nin: [null, ''],
        };
    }
  }
  throw new Error(`Unknown operator ${operator}`);
}

/**
 * Reverses create() - returns an object with `operator` and `value` keys. Returns null if unrecognized query.
 */
function parse(query) {
  if ('$regex' in query && matchesBeginning(query.$regex) && matchesEnd(query.$regex)) {
    return { operator: 'is', value: unescapeRegex(query.$regex.slice(1, query.$regex.length - 1)) };
  } else if (
    '$not' in query &&
    matchesBeginning(query.$not.$regex) &&
    matchesEnd(query.$not.$regex)
  ) {
    return {
      operator: 'is not',
      value: unescapeRegex(query.$not.$regex.slice(1, query.$not.$regex.length - 1)),
    };
  } else if ('$regex' in query && matchesBeginning(query.$regex)) {
    return { operator: 'starts with', value: unescapeRegex(query.$regex.slice(1)) };
  } else if ('$regex' in query && matchesEnd(query.$regex)) {
    return {
      operator: 'ends with',
      value: unescapeRegex(query.$regex.slice(0, query.$regex.length - 1)),
    };
  } else if ('$regex' in query) {
    return { operator: 'contains', value: unescapeRegex(query.$regex) };
  } else if ('$not' in query) {
    return { operator: 'does not contain', value: unescapeRegex(query.$not.$regex) };
  } else if (isIsEmptyQuery(query)) {
    return { operator: 'is empty' };
  } else if (isIsNotEmptyQuery(query)) {
    return { operator: 'is not empty' };
  } else {
    return null;
  }
}

/**
 * Return true if the regex matches the beginning of the string.
 */
function matchesBeginning(regexStr) {
  return regexStr.startsWith('^');
}

/**
 * Returns true if the regex matches to the end of the string.
 */
function matchesEnd(regexStr) {
  // Make sure the last character isn't escaped, if there is one.
  return /(^|[^\\])\$$/.test(regexStr);
}

// Copied from https://github.com/sindresorhus/escape-string-regexp/blob/master/index.js
const charsToEscape = ['|', '\\', '{', '}', '(', ')', '[', ']', '^', '$', '+', '*', '?', '.'];

function escapeRegex(str) {
  const escapedChars = charsToEscape.map((char) => `\\${char}`);
  return str.replace(new RegExp(`(${escapedChars.join('|')})`, 'g'), '\\$&');
}

function unescapeRegex(regexStr) {
  const escapedChars = charsToEscape.map((char) => `\\\\\\${char}`);
  return regexStr.replace(new RegExp(`(${escapedChars.join('|')})`, 'g'), (match) =>
    match.slice(1)
  );
}

module.exports = { create, parse, supportedOperators };
