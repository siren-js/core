import { Transform, Type } from 'class-transformer';
import { ArrayUnique, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

import { Action, ActionLike } from './Action';
import { EmbeddedEntity, EmbeddedEntityLike } from './EmbeddedEntity';
import { EmbeddedLink } from './EmbeddedLink';
import { Link } from './Link';
import { Extendable, transformAndValidate, transformSubEntities, UnknownRecord } from './utils';

export type EntityLike<T extends UnknownRecord = UnknownRecord> = Pick<
  Entity<T>,
  'class' | 'links' | 'properties' | 'title'
> & {
  actions?: ActionLike[];
  entities?: (EmbeddedEntityLike | EmbeddedLink)[];
} & Extendable;

/**
 * Represents a URI-addressable resource
 */
export class Entity<T extends UnknownRecord = UnknownRecord> {
  /**
   * Available behavior exposed by the `Entity`
   */
  @ArrayUnique((action: Action) => action.name)
  @IsOptional()
  @Type(() => Action)
  @ValidateNested({ each: true })
  actions?: Action[];

  /**
   * List of strings describing the nature of the `Entity` based on the current representation. Possible values are
   * implementation-dependent and should be documented.
   */
  @IsOptional()
  @IsString({ each: true })
  class?: string[];

  /**
   * Related entities represented as embedded links or representations
   */
  @IsOptional()
  @Transform(({ value }) => transformSubEntities(value))
  @ValidateNested({ each: true })
  entities?: (EmbeddedEntity | EmbeddedLink)[];

  /**
   * Navigation links that communicate ways to navigate outside the entity graph
   */
  @IsOptional()
  @Type(() => Link)
  @ValidateNested({ each: true })
  links?: Link[];

  /**
   * Key-value pairs describing the state of the `Entity`
   */
  @IsOptional()
  @IsObject()
  properties?: T;

  /**
   * Descriptive text about the `Entity`
   */
  @IsOptional()
  @IsString()
  title?: string;

  [extension: string]: unknown;

  /**
   * Finds an `Action` in this `Entity` with the given `name`. Returns `undefined` if no `Action` exists with that
   * `name`.
   */
  findActionByName(name: string): Action | undefined {
    return this.actions?.find((action) => action.name === name);
  }

  /**
   * Finds all sub-entities in this `Entity` with the given `rels`. Returns an empty array if no sub-entities match.
   */
  findEntitiesByRel(...rels: string[]): (EmbeddedEntity | EmbeddedLink)[] {
    return this.entities?.filter((entity) => rels.every((rel) => entity.rel.includes(rel))) ?? [];
  }

  /**
   * Finds all `Link`s in this `Entity` with the given `rels`. Returns an empty array if no `Link`s match.
   */
  findLinksByRel(...rels: string[]): Link[] {
    return this.links?.filter((link) => rels.every((rel) => link.rel.includes(rel))) ?? [];
  }

  static of<T extends UnknownRecord = UnknownRecord>(entity: EntityLike): Entity<T> {
    return transformAndValidate<Entity<T>>(this, entity);
  }
}
