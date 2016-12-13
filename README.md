## mongo-regex-description

This library will create a Mongo-style regex from a "description" (a tuple of an operator and a value). This is useful for building UIs on top of Mongo or [Sift](https://www.npmjs.com/package/sift) `$regex` operators.

Example:

```js
var regExpDescription = require('mongo-regex-description');

var regex = regExpDescription.create({
	operator: 'is not',
	value: 'my value'
});
// { $not: { $regex: '^my value$', $options: 'i' } }


var description = regExpDescription.parse({
	$not: {
		$regex: '^my value$',
		$options: 'i'
	}
});
// { operator: 'is not', value: 'my value' }

```

### Supported Operators

* `is`: Matches exactly, but case insensitively
* `is not`: Negates `is`
* `contains`: Matches if `value` exists inside, case insensitively
* `does not contain`: Negates `contains`
* `starts with`: Matches if `value` exists at the beginning of the string, case insensitively
* `ends with`: Matches if `value` exists at the end of the string, case insensitively


## Changelog

* 1.2.0 Can be used in the browser (use `npm build` and consume the file `dist/browser/index.js`)
* 1.1.1 Reordered `supportedOperators` to put more commonly used `contains` first.
* 1.1.0 Added `require('mongo-regex-description').supportedOperators` array as a convenience.
* 1.0.1 `parse()` returns null if it can't parse the query.
* 1.0.0 Initial release