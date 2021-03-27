import * as coerce from './util/coerce';
import extendWith from './util/extend-with';
import { isNonNullObject, isNullish, isString } from './util/type-guard';

/**
 * @typedef {object} FieldOptions Optional Field members and extensions
 * @property {string | string[]} [class] A list of strings describing aspects of
 *    the `Field` based on the current representation. Possible values are
 *    implementation-dependent and should be documented. Setting the value to a
 *    `string` will result in a singleton array.
 * @property {string} [title] Textual annotation of a field. Clients may use
 *    this as a label.
 * @property {string} [type] Input type of the field. May include any of the
 *    [input types from HTML](https://html.spec.whatwg.org/multipage/input.html#the-input-element).
 * @property {any} [value] The value assigned to the `Field`.
 */

/**
 * Represents a control inside an `Action`. Serialization of a `Field` depends
 * on its `type` and its corresponding `Action`'s `type`.
 */
export class Field {
  #name;
  #class;
  #title;
  #type;
  #value;

  /**
   * @param {string} name A name describing the control. Must be unique within
   *    an `Action`.
   * @param {FieldOptions} options Optional `Field` members (`class`, `title`,
   *    `type`, `value`) and extensions
   */
  constructor(name, options = {}) {
    if (!isString(name)) {
      throw new TypeError('Field.name must be a string');
    }

    const { class: fieldClass, title, type, value, ...extensions } =
      options ?? {};

    this.#name = name;
    this.class = fieldClass;
    this.title = title;
    this.type = type;
    this.value = value;

    extendWith(this, extensions);
  }

  /**
   * A name describing the control. Must be unique within an `Action`.
   * @type {string}
   */
  get name() {
    return this.#name;
  }

  /**
   * A list of strings describing aspects of the `Field` based on the current
   * representation. Possible values are implementation-dependent and should be
   * documented. Setting the value to a `string` will result in a singleton
   * array.
   * @type {readonly string[]}
   */
  get class() {
    return this.#class;
  }

  set class(value) {
    this.#class = coerce.toOptionalStringArray(value, this.class);
  }

  /**
   * Textual annotation of a field. Clients may use this as a label.
   * @type {string}
   */
  get title() {
    return this.#title;
  }

  set title(value) {
    this.#title = coerce.toOptionalString(value, this.title);
  }

  /**
   * Input type of the field. May include any of the
   * [input types from HTML](https://html.spec.whatwg.org/multipage/input.html#the-input-element).
   * When missing, the default is assumed to be `text`.
   * @type {string}
   */
  get type() {
    return this.#type;
  }

  set type(value) {
    this.#type = coerce.toOptionalString(value, this.type);
  }

  /**
   * The value assigned to the `Field`.
   * @type {any}
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
    const { name, class: fieldClass, title, type, value, ...extensions } = this;
    return { name, class: fieldClass, title, type, value, ...extensions };
  }

  /**
   * Determines whether `value` is a parsable Siren field (i.e., can be passed
   * to `Field.of`)
   * @param {unknown} value
   * @returns {boolean}
   */
  static isValid(value) {
    return (
      value instanceof Field || (isNonNullObject(value) && isString(value.name))
    );
  }

  /**
   * Constructs a `Field` instance from any object. Use `Field.isValid`
   * beforehand to avoid unexpected behavior.
   * @param {Record<string, unknown>} value
   * @returns {Field}
   */
  static of(value) {
    if (value instanceof Field) {
      return value;
    }
    const { name, ...rest } = value;
    return new Field(name, rest);
  }
}
