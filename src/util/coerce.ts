import {
  isArray,
  isMediaTypeString,
  isNullish,
  isString,
  TypeGuard,
  UnknownRecord
} from './type-guard';

export function toStringArray(
  value: unknown,
  defaultValue: readonly string[]
): readonly string[] {
  if (isString(value)) {
    return Object.freeze([value]);
  } else if (isArray(value)) {
    return Object.freeze(value.filter(isString));
  } else {
    return defaultValue;
  }
}

export const toOptionalStringArray = (
  value: unknown,
  defaultValue: readonly string[] | undefined
): readonly string[] | undefined =>
  isNullish(value)
    ? undefined
    : toStringArray(value, <readonly string[]>defaultValue);

function coerceOptional<T>(isValid: TypeGuard<T>) {
  return (value: unknown, defaultValue: T | undefined) => {
    if (isValid(value)) {
      return value;
    } else if (isNullish(value)) {
      return undefined;
    } else {
      return defaultValue;
    }
  };
}

export const toOptionalString = coerceOptional(isString);

export const toOptionalMediaTypeString = coerceOptional(isMediaTypeString);

export function toUriReference(value: unknown, defaultValue: string): string {
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

export function toUniqueSubComponents<
  T extends { name: string; class?: readonly string[] }
>(
  values: readonly unknown[] | undefined,
  defaultValue: readonly T[] | undefined,
  isValid: TypeGuard<UnknownRecord>,
  parse: (value: UnknownRecord) => T,
  nameIndex: Map<string, T>,
  classIndex: Map<string, T[]>
): readonly T[] | undefined {
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
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            classIndex.get(className)!.push(component);
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
