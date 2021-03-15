import { isArray, isNullish, isString } from './type-guard';

export function toStringArray(value, defaultValue) {
    if (isString(value)) {
        return Object.freeze([value]);
    } else if (isArray(value)) {
        return Object.freeze(value.filter(isString));
    } else {
        return defaultValue;
    }
}

export const toOptionalStringArray = (value, defaultValue) =>
    isNullish(value) ? undefined : toStringArray(value, defaultValue);

export function toOptionalString(value, defaultValue) {
    if (isString(value)) {
        return value;
    } else if (isNullish(value)) {
        return undefined;
    } else {
        return defaultValue;
    }
}
