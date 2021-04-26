export function extendWith(object: Extendable, extensions: Extendable): void {
  Object.keys(extensions).forEach((key) => {
    object[key] = extensions[key];
  });
}

export interface Extendable {
  [extension: string]: unknown;
}
