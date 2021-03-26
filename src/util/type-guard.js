const typeGuard = (predicate) => (value) => predicate(value);

const typeOfTypeGuard = (type) => typeGuard((value) => typeof value === type);

const valueTypeGuard = (t) => typeGuard((value) => value === t);

export const isNull = valueTypeGuard(null);
export const isUndefined = valueTypeGuard(undefined);

/**
 * Determines whether a value is `null` or `undefined`.
 */
export const isNullish = typeGuard(
  (value) => isNull(value) || isUndefined(value)
);

export const isString = typeOfTypeGuard('string');

export const isArray = Array.isArray;

export const isTypedArray = (value, itemTypeGuard) =>
  isArray(value) && value.every(itemTypeGuard);

export const isStringArray = typeGuard((value) =>
  isTypedArray(value, isString)
);

/**
 * Determines if a value is an object, array, or `null` (i.e., the `typeof`
 * operator returns `'object'`).
 */
export const isObject = typeOfTypeGuard('object');

/**
 * Similar to `isObject` except it excludes `null`.
 */
export const isNonNullObject = typeGuard(
  (value) => isObject(value) && !isNull(value)
);

/**
 * Determines whether a value is an object and *not* an array or `null`.
 */
export const isRecord = typeGuard(
  (value) => isNonNullObject(value) && !isArray(value)
);

/**
 * Determines whether `value` is a valid media type string, as defined in
 * [Section 3.4.1 of RFC 8288](https://tools.ietf.org/html/rfc8288#section-3.4.1).
 */
export const isMediaTypeString = (value) =>
  isString(value) && mediaTypeRegExp.test(value);

const mediaTypeRegExp = /[A-Za-z0-9][\w!#$&\-^.+]{0,126}\/[A-Za-z0-9][\w!#$&\-^.+]{0,126}/;
//                       \___rnf___/\_______rnc________/  \___rnf___/\_______rnc________/
//                        \______restricted-name______/    \______restricted-name______/
//                         \________type-name________/      \______subtype-name_______/

/**
 * Determines whether `value` is a valid URI.
 */
export function isUri(value) {
  if (value instanceof URL) {
    return true;
  }
  if (!isString(value)) {
    return false;
  }
  try {
    new URL(value, 'http://example.com');
    return true;
  } catch {
    return false;
  }
}
