import { isArray, isMediaTypeString, isNullish, isString } from './type-guard';

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

export function toOptionalMediaTypeString(value, defaultValue) {
    if (isMediaTypeString(value)) {
        return value;
    } else if (isNullish(value)) {
        return undefined;
    } else {
        return defaultValue;
    }
}

export function toUriReference(value, defaultValue) {
    if (value instanceof URL) {
        return value.toString();
    }
    if (!isString(value)) {
        return defaultValue;
    }
    try {
        // try to parse as absolute URI
        new URL(value);
        return value;
    } catch {
        try {
            // try to parse as relative URI
            const url = new URL(value, 'http://example.com');
            return url.pathname;
        } catch {
            return defaultValue;
        }
    }
}

export function toUniqueSubComponents(value, defaultValue, validator, factory) {
    if (isArray(value)) {
        const [components] = value
            .filter(validator)
            .map(factory)
            .reduce(
                ([components, names], component) => {
                    if (!names.has(component.name)) {
                        components.push(component);
                        names.add(component.name);
                    }
                    return [components, names];
                },
                [[], new Set()]
            );
        return Object.freeze(components);
    } else if (isNullish(value)) {
        return undefined;
    } else {
        return defaultValue;
    }
}
