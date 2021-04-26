/* eslint-disable @typescript-eslint/no-explicit-any */
export function construct<T>(t: new (...args: any[]) => T, ...args: any[]): T {
  return new t(...args);
}
