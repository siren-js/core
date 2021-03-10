import { isArray, isNullOrUndefined, isString } from './type-guard';

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
    isNullOrUndefined(value) ? undefined : toStringArray(value, defaultValue);

export function toOptionalString(value, defaultValue) {
    if (isString(value)) {
        return value;
    } else if (isNullOrUndefined(value)) {
        return undefined;
    } else {
        return defaultValue;
    }
}
