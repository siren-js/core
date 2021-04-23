import * as coerce from './util/coerce';
import { Extendable, extendWith } from './util/extend-with';
import {
  isNullish,
  isRecord,
  isString,
  UnknownRecord
} from './util/type-guard';

/**
 * Represents an input control inside an `Action`. Serialization of a `Field`
 * depends on its `type` and its corresponding `Action`'s `type`.
 */
export class Field<T = unknown> implements Extendable {
  #name = '';
  #class?: readonly string[];
  #title?: string;
  #type?: string;
  #value?: T;
  [extension: string]: unknown;

  /**
   * @param name A name describing the control. Must be unique within an
   *    `Action`.
   * @param options Optional members (`class`, `title`, etc.) and extensions
   * @throws {TypeError} If `name` is not a `string`
   */
  constructor(name: string, options: FieldOptions = {}) {
    if (!isString(name)) {
      throw new TypeError('Field.name must be a string');
    }

    const { class: classNames, title, type, value, ...extensions } =
      options ?? {};

    this.#name = name;
    this.class = <readonly string[]>classNames;
    this.title = title;
    this.type = type;
    this.value = <T>value;

    extendWith(this, extensions);
  }

  /**
   * A name describing the control. Must be unique within an `Action`.
   */
  get name() {
    return this.#name;
  }

  /**
   * A list of strings describing the nature of the `Field` based on the current
   * representation. Possible values are implementation-dependent and should be
   * documented. Setting the value to a `string` will result in a singleton
   * array.
   */
  get class() {
    return this.#class;
  }

  set class(value) {
    this.#class = coerce.toOptionalStringArray(value, this.class);
  }

  /**
   * Textual annotation of a field. Clients may use this as a label.
   */
  get title() {
    return this.#title;
  }

  set title(value) {
    this.#title = coerce.toOptionalString(value, this.title);
  }

  /**
   * Input type of the field. May include any of the
   * [input types from HTML](https://html.spec.whatwg.org/multipage/input.html#attr-input-type).
   * When missing, the default is assumed to be `text`.
   */
  get type() {
    return this.#type;
  }

  set type(value) {
    this.#type = coerce.toOptionalString(value, this.type);
  }

  /**
   * The value assigned to the `Field`.
   */
  get value() {
    return this.#value;
  }

  set value(value) {
    this.#value = isNullish(value) ? undefined : value;
  }

  /**
   * Customizes JSON serialization (via `JSON.stringify()`) to include
   * properties defined as getters
   */
  toJSON() {
    const { name, class: classNames, title, type, value, ...extensions } = this;
    return { name, class: classNames, title, type, value, ...extensions };
  }

  /**
   * Determines whether `value` is a parsable Siren field (i.e., can be passed
   * to `Field.of`)
   */
  static isValid(value: unknown): value is UnknownRecord {
    return value instanceof Field || (isRecord(value) && isString(value.name));
  }

  /**
   * Constructs a `Field` instance from any object. Use `Field.isValid`
   * beforehand to avoid unexpected behavior.
   */
  static of(value: UnknownRecord): Field {
    if (value instanceof Field) {
      return value;
    }
    const { name, ...rest } = value;
    return new Field(<string>name, rest);
  }
}

/**
 * Optional `Field` members and extensions
 */
export interface FieldOptions<T = unknown> extends Extendable {
  /**
   * A list of strings describing the nature of the `Field` based on the current
   * representation. Possible values are implementation-dependent and should be
   * documented. Setting the value to a `string` will result in a singleton
   * array.
   */
  class?: string | readonly string[];
  /**
   * Textual annotation of the `Field`. Clients may use this as a label.
   */
  title?: string;
  /**
   * Input type of the field. May include any of the
   * [input types from HTML](https://html.spec.whatwg.org/multipage/input.html#the-input-element).
   */
  type?: string;
  /**
   * The value assigned to the `Field`.
   */
  value?: T;
}
