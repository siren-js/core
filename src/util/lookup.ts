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
  return lookUpByProperty(index, rels, 'rel');
}

export interface Relatable {
  rel: readonly string[];
}

/**
 * @param index Components indexed by the given property
 * @param search List of search terms
 * @param property Component property to search by
 */
function lookUpByProperty<T>(
  index: Map<string, T[]>,
  search: string[],
  property: keyof T
): T[] {
  if (search.length === 0) {
    throw new Error(`must provide one or more ${property} values`);
  } else if (search.length === 1) {
    return index.get(search[0]) ?? [];
  }
  const componentsByProperty = new Set<T>();
  for (const key of search) {
    const components = index.get(key) ?? [];
    for (const component of components) {
      const value = <unknown>component[property];
      const propertyValues = new Set<string>(<string[]>value);
      if (search.every((key) => propertyValues.has(key))) {
        componentsByProperty.add(component);
      }
    }
  }
  return [...componentsByProperty];
}
