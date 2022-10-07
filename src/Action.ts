import { Type } from 'class-transformer';
import { ArrayUnique, IsMimeType, IsOptional, IsString, ValidateNested } from 'class-validator';

import { Field } from './Field';
import { Extendable, transformAndValidate } from './utils';
import { IsUri } from './utils/IsUri';

export type ActionLike = Pick<Action, 'class' | 'fields' | 'href' | 'method' | 'name' | 'title' | 'type'> & Extendable;

/**
 * Represents available behavior exposed by an `Entity`.
 */
export class Action {
  /**
   * List of strings describing the nature of the `Action` based on the current representation. Possible values are
   * implementation-dependent and should be documented.
   */
  @IsOptional()
  @IsString({ each: true })
  class?: string[];

  /**
   * Input controls of the `Action`.
   */
  @ArrayUnique((field: Field) => field.name)
  @IsOptional()
  @Type(() => Field)
  @ValidateNested({ each: true })
  fields?: Field[];

  /**
   * URI of the action
   */
  @IsUri()
  href!: string;

  /**
   * Protocol method used when submitting the `Action`. When missing, the default is assumed to be `'GET'`.
   */
  @IsOptional()
  @IsString()
  method?: string = 'GET';

  /**
   * Name identifying the action to be performed. Must be unique within an `Entity`'s `actions`.
   */
  @IsString()
  name!: string;

  /**
   * Descriptive text about the `Action`.
   */
  @IsOptional()
  @IsString()
  title?: string;

  /**
   * Encoding type indicating how `fields` are serialized when submitting the `Action`. When missing, the default is
   * assumed to be `'application/x-www-form-urlencoded'`.
   */
  @IsOptional()
  @IsMimeType()
  type?: string = 'application/x-www-form-urlencoded';

  [extension: string]: unknown;

  /**
   * Finds all `Field`s in this `Action` with the given `name`. Returns `undefined` if no `Field` exists with that
   * `name`.
   */
  findFieldByName(name: string): Field | undefined {
    return this.fields?.find((field) => field.name === name);
  }

  /**
   * Finds all `Field`s in this `Action` with the given `classes`. Returns an empty array if no `Field`s match.
   */
  findFieldsByClass(...classes: string[]): Field[] {
    return this.fields?.filter((field) => classes.every((c) => field.class?.includes(c))) ?? [];
  }

  static of(action: ActionLike): Action {
    return transformAndValidate(this, action);
  }
}
