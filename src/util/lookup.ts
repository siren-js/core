/**
 * @param index Components indexed by class
 * @param classes List of class values to search
 */
export function lookUpByClass<T extends Classifiable>(
  index: Map<string, T[]>,
  classes: string[]
): T[] {
  return lookUpByProperty(index, classes, 'class');
}

export interface Classifiable {
  class?: readonly string[];
}

/**
 * @param index Components indexed by rel
 * @param rels List of link relations to search
 */
export function lookUpByRel<T extends Relatable>(
  index: Map<string, T[]>,
  rels: string[]
): T[] {
  return lookUpByProperty(index, rels, 'rel', true);
}

export interface Relatable {
  rel: readonly string[];
}

/**
 * @param index Components indexed by the given property
 * @param search List of search keys
 * @param property Component property to search by
 * @param ignoreCase Whether to perform a case-insensitive comparison of keys
 */
function lookUpByProperty<T>(
  index: Map<string, T[]>,
  search: string[],
  property: keyof T,
  ignoreCase = false
): T[] {
  const keyMapper = (str: string) => (ignoreCase ? str.toLowerCase() : str);
  const keys = search.map(keyMapper);
  if (keys.length === 0) {
    throw new Error(`must provide one or more ${property} values`);
  } else if (keys.length === 1) {
    return index.get(keys[0]) ?? [];
  }
  const componentsByProperty = new Set<T>();
  for (const key of keys) {
    const components = index.get(keyMapper(key)) ?? [];
    for (const component of components) {
      const value = <unknown>component[property];
      const propertyValues = new Set<string>((<string[]>value).map(keyMapper));
      if (keys.every((key) => propertyValues.has(key))) {
        componentsByProperty.add(component);
      }
    }
  }
  return [...componentsByProperty];
}
