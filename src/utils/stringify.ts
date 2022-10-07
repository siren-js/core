import { Entity } from '../Entity';

/**
 * Converts an `Entity` to JSON text
 */
export function stringify(entity: Entity): string {
  return JSON.stringify(entity);
}
