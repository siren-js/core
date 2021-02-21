/**
 * Copyright (C) 2020  Dillon Redding
 *
 * See the full notice in the LICENSE file at the top level of the repository.
 */
import { isArray, isMediaTypeString, isNullOrUndefined } from './type-guards';

/**
 * If `value` is already an array, the values are mapped to strings. `null` and
 * `undefined` result in an empty array. All other values are converted to a
 * string and wrapped in a singleton array.
 */
export function toStringArray(value: unknown): string[] {
    if (isArray(value)) {
        return value.filter(x => !isNullOrUndefined(x)).map(String);
    } else if (isNullOrUndefined(value)) {
        return [];
    } else {
        return [String(value)];
    }
}

/**
 * Similar to `toStringArray` except `null` and `undefined` coerce to
 * `undefined`.
 */
export function toOptionalStringArray(value: unknown): string[] | undefined {
    return isNullOrUndefined(value) ? undefined : toStringArray(value);
}

/**
 * Coerces `null` and `undefined` to an empty string. All other values are
 * converted to strings.
 */
export function toString(value: unknown): string {
    return isNullOrUndefined(value) ? '' : String(value);
}

/**
 * Similar to `toString` except `null` and `undefined` coerce to `undefined`.
 */
export function toOptionalString(value: unknown): string | undefined {
    return isNullOrUndefined(value) ? undefined : String(value);
}

/**
 * Uses the [`toString()`](https://developer.mozilla.org/en-US/docs/Web/API/URL/toString)
 * method, if `value` is a [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL).
 * Otherwise, `value` is parsed as an absolute URL. If that fails, `value` is
 * parsed as a relative URL. If that fails, a `TypeError` is thrown. If `value`
 * is `null` or `undefined`, a `TypeError` is thrown.
 */
export function toUriString(value: unknown): string {
    if (value instanceof URL) {
        return value.toString();
    } else if (isNullOrUndefined(value)) {
        throw new TypeError('URI cannot be null or undefined');
    } else {
        try {
            // try to parse as absolute URL
            new URL(value as string);
            return value as string;
        } catch {
            try {
                // try to parse as relative URL
                const url = new URL(value as string, 'http://example.com');
                return url.pathname;
            } catch {
                throw new TypeError(`Cannot parse invalid URI: ${value}`);
            }
        }
    }
}

/**
 * Coerces invalid media type strings to `undefined`. Valid media type strings
 * are returned as-is.
 */
export function toMediaTypeString(value: unknown): string | undefined {
    return isMediaTypeString(value) ? value : undefined;
}
