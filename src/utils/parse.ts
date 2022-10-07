import { Entity } from '../Entity';
import { UnknownRecord } from './UnknownRecord';

/**
 * Converts JSON text to an `Entity`
 */
export function parse<T extends UnknownRecord = UnknownRecord>(json: string): Entity<T> {
  return Entity.of(JSON.parse(json));
}
