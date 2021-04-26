export type TypeGuard<T> = (value: unknown) => value is T;

function typeGuard<T>(predicate: (value: unknown) => boolean): TypeGuard<T> {
  return (value): value is T => predicate(value);
}

function typeOfTypeGuard<T>(type: TypeOfType): TypeGuard<T> {
  return typeGuard((value) => typeof value === type);
}

type TypeOfType =
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'symbol'
  | 'undefined'
  | 'object'
  | 'function';

function valueTypeGuard<T>(t: T): TypeGuard<T> {
  return typeGuard((value) => value === t);
}

export const isNull = valueTypeGuard(null);
export const isUndefined = valueTypeGuard(undefined);

/**
 * Determines whether a value is `null` or `undefined`.
 */
export const isNullish: TypeGuard<null | undefined> = typeGuard(
  (value) => isNull(value) || isUndefined(value)
);

export const isString: TypeGuard<string> = typeOfTypeGuard('string');

export const isArray: TypeGuard<unknown[]> = Array.isArray;

/**
 * Determines if a value is an object, array, or `null` (i.e., the `typeof`
 * operator returns `'object'`).
 */
export const isObject: TypeGuard<ObjectLike> = typeOfTypeGuard('object');

export type ObjectLike = NonNullObject | null;
export type NonNullObject = UnknownRecord | unknown[];
export type UnknownRecord = Record<string, unknown>;

/**
 * Similar to `isObject` except it excludes `null`.
 */
export const isNonNullObject: TypeGuard<NonNullObject> = typeGuard(
  (value) => isObject(value) && !isNull(value)
);

/**
 * Determines whether a value is an object and *not* an array or `null`.
 */
export const isRecord: TypeGuard<UnknownRecord> = typeGuard(
  (value) => isNonNullObject(value) && !isArray(value)
);

/**
 * Determines whether `value` is a valid media type string, as defined in
 * [Section 3.4.1 of RFC 8288](https://tools.ietf.org/html/rfc8288#section-3.4.1).
 */
export const isMediaTypeString: TypeGuard<string> = (value): value is string =>
  isString(value) && mediaTypeRegExp.test(value);

const mediaTypeRegExp = /[A-Za-z0-9][\w!#$&\-^.+]{0,126}\/[A-Za-z0-9][\w!#$&\-^.+]{0,126}/;
//                       \___rnf___/\_______rnc________/  \___rnf___/\_______rnc________/
//                        \______restricted-name______/    \______restricted-name______/
//                         \________type-name________/      \______subtype-name_______/

/**
 * Determines whether `value` is a valid URI.
 */
export function isUri(value: unknown): value is string {
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
