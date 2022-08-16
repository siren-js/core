import { IsOptional, IsString } from 'class-validator';

import { transformAndValidate } from './utils';

/**
 * Represents an input control inside an `Action`. Serialization of a `Field` depends on its `type` and its
 * corresponding `Action`'s `type`.
 */
export class Field<T = unknown> {
  /**
   * List of strings describing the nature of the `Field` based on the current representation. Possible values are
   * implementation-dependent and should be documented.
   */
  @IsOptional()
  @IsString({ each: true })
  class?: string[];

  /**
   * Name describing the control. Must be unique within an `Action`.
   */
  @IsString()
  name!: string;

  /**
   * Textual annotation of a field. Clients may use this as a label.
   */
  @IsOptional()
  @IsString()
  title?: string;

  /**
   * Input type of the field. May include any of the [input types from HTML](https://html.spec.whatwg.org/multipage/input.html#attr-input-type).
   * When missing, the default is assumed to be `text`.
   */
  @IsOptional()
  @IsString()
  type?: string = 'text';

  /**
   * Value assigned to the `Field`.
   */
  @IsOptional()
  value?: T;

  [extension: string]: unknown;

  static of(field: Field): Field {
    return transformAndValidate(this, field);
  }
}
