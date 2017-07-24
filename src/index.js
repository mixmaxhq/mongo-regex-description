var supportedOperators = ['contains', 'does not contain', 'is', 'is not', 'is any of', 'starts with', 'ends with'];

/**
 * Returns a Mongo query that can be used a value for a field, given an operator and a value.
 * See readme for supported values.
 */
function create(operator, value) {
  if (supportedOperators.indexOf(operator) < 0) throw new Error(`Unknown operator ${operator}`);

  if (operator === 'is') {
    // Assume case-insensitive
    return {
      $regex: `^${escapeRegex(value)}$`,
      $options: 'i'
    };
  } else if (operator === 'is not') {
    // Assume case-insensitive
    return {
      $not: {
        $regex: `^${escapeRegex(value)}$`,
        $options: 'i'
      }
    };
  } else if (operator === 'is any of') {
    if (!Array.isArray(value)) throw new Error(`When called with argument 'operator' 'is any of', expected argument 'value' to be of type 'Array'.`);
    const conditions = value.map((condition) => {
      return ({
        $regex: `^${escapeRegex(condition)}$`,
        $options: 'i'
      });
    });
    return {
      $or: conditions
    };
  } else if (operator === 'contains') {
    return {
      $regex: escapeRegex(value),
      $options: 'i'
    };
  } else if (operator === 'does not contain') {
    return {
      $not: {
        $regex: escapeRegex(value),
        $options: 'i'
      }
    };
  } else if (operator === 'starts with') {
    return {
      $regex: `^${escapeRegex(value)}`,
      $options: 'i'
    };
  } else if (operator === 'ends with') {
    return {
      $regex: `${escapeRegex(value)}$`,
      $options: 'i'
    };
  }
}

/**
 * Reverses create() - returns an object with `operator` and `value` keys. Returns null if unrecognized query.
 */
function parse(query) {
  if ('$regex' in query && matchesBeginning(query.$regex) && matchesEnd(query.$regex)) {
    return { operator: 'is', value: unescapeRegex(query.$regex.slice(1, query.$regex.length - 1)) };
  } else if ('$not' in query && matchesBeginning(query.$not.$regex) && matchesEnd(query.$not.$regex)) {
    return { operator: 'is not', value: unescapeRegex(query.$not.$regex.slice(1, query.$not.$regex.length - 1)) };
  } else if ('$or' in query) {
    return { operator: 'is any of', value: query.$or.map((condition) => {
        return unescapeRegex(condition.$regex.slice(1, condition.$regex.length - 1));
      })
    };
  } else if ('$regex' in query && matchesBeginning(query.$regex)) {
    return { operator: 'starts with', value: unescapeRegex(query.$regex.slice(1)) };
  } else if ('$regex' in query && matchesEnd(query.$regex)) {
    return { operator: 'ends with', value: unescapeRegex(query.$regex.slice(0, query.$regex.length - 1)) };
  } else if ('$regex' in query) {
    return { operator: 'contains', value: unescapeRegex(query.$regex) };
  } else if ('$not' in query) {
    return { operator: 'does not contain', value: unescapeRegex(query.$not.$regex) };
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
  // Make sure the last character isn't escaped.
  return /[^\\]\$$/.test(regexStr);
}

// Copied from https://github.com/sindresorhus/escape-string-regexp/blob/master/index.js
var charsToEscape = ['|', '\\', '{', '}', '(', ')', '[', ']', '^', '$', '+', '*', '?', '.'];

function escapeRegex(str) {
  var escapedChars = charsToEscape.map(char => `\\${char}`);
  return str.replace(new RegExp(`(${escapedChars.join('|')})`, 'g'), '\\$&');
}

function unescapeRegex(regexStr) {
  var escapedChars = charsToEscape.map(char => `\\\\\\${char}`);
  return regexStr.replace(new RegExp(`(${escapedChars.join('|')})`, 'g'), match => match.slice(1));
}

module.exports = { create, parse, supportedOperators };