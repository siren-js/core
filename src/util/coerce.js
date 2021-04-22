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

function toOptional(value, defaultValue, isValid) {
  if (isValid(value)) {
    return value;
  } else if (isNullish(value)) {
    return undefined;
  } else {
    return defaultValue;
  }
}

export const toOptionalString = (value, defaultValue) =>
  toOptional(value, defaultValue, isString);

export const toOptionalMediaTypeString = (value, defaultValue) =>
  toOptional(value, defaultValue, isMediaTypeString);

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

/**
 * @template {{ name: string; class?: string[] }} T
 * @param {readonly unknown[]} values
 * @param {readonly T[]} defaultValue
 * @param {(value: unknown) => value is Record<string, unknown>} isValid
 * @param {(value: Record<string, unknown>) => T} parse
 * @param {Map<string, T>} nameIndex
 * @param {Map<string, T[]} classIndex
 * @returns {readonly T[] | undefined}
 */
export function toUniqueSubComponents(
  values,
  defaultValue,
  isValid,
  parse,
  nameIndex,
  classIndex
) {
  if (isArray(values)) {
    nameIndex.clear();
    classIndex.clear();
    for (const value of values) {
      if (isValid(value)) {
        const component = parse(value);
        if (!nameIndex.has(component.name)) {
          nameIndex.set(component.name, component);
          component.class?.forEach((className) => {
            if (!classIndex.has(className)) {
              classIndex.set(className, []);
            }
            classIndex.get(className).push(component);
          });
        }
      }
    }
    return Object.freeze([...nameIndex.values()]);
  } else if (isNullish(values)) {
    nameIndex.clear();
    classIndex.clear();
    return undefined;
  } else {
    return defaultValue;
  }
}
