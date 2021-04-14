/**
 * @template {{ class: readonly string[] }} T
 * @param {Map<string, T[]>} index Components indexed by class
 * @param {string[]} classes List of class values to search
 * @returns {T[]}
 */
export function lookUpByClass(index, classes) {
  return lookUpByProperty(index, classes, 'class');
}

/**
 * @template {{ rel: readonly string[] }} T
 * @param {Map<string, T[]>} index Components indexed by rel
 * @param {string[]} rels List of link relations to search
 * @returns {T[]}
 */
export function lookUpByRel(index, rels) {
  return lookUpByProperty(index, rels, 'rel');
}

/**
 * @template T
 * @param {Map<string, T[]>} index Components indexed by the given property
 * @param {string[]} search List of search terms
 * @param {string} property Component property to search by
 * @returns {T[]}
 */
function lookUpByProperty(index, search, property) {
  if (search.length === 0) {
    throw new Error(`must provide one or more ${property} values`);
  } else if (search.length === 1) {
    return index.get(search[0]) ?? [];
  }
  const componentsByProperty = new Set();
  for (const key of search) {
    const components = index.get(key) ?? [];
    for (const component of components) {
      const propertyValues = new Set(component[property]);
      if (search.every((key) => propertyValues.has(key))) {
        componentsByProperty.add(component);
      }
    }
  }
  return [...componentsByProperty];
}
