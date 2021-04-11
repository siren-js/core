import { Field } from './field';
import * as coerce from './util/coerce';
import extendWith from './util/extend-with';
import { isNonNullObject, isString, isUri } from './util/type-guard';

export * from './field';

/**
 * @typedef {object} ActionOptions Optional `Action` members and extensions
 * @property {string | readonly string[]} [class] A list of strings describing
 *    the nature of the `Action` based on the current representation. Possible
 *    values are implementation-dependent and should be documented. Setting the
 *    value to a `string` will result in a singleton array.
 * @property {readonly Field[]} [fields] Input controls of the `Action`
 * @property {string} [method] The protocol method used when submitting the
 *    `Action`
 * @property {string} [title] Descriptive text about the `Action`
 * @property {string} [type] The encoding type indicating how `fields` are
 *    serialized when submitting the `Action`. Setting to
 *    a value that does not match the ABNF `type-name "/" subtype-name` (see
 *    [Section 4.2 of RFC 6838](https://tools.ietf.org/html/rfc6838#section-4.2))
 *    will be ignored.
 */

/**
 * Represents available behavior exposed by an `Entity`.
 */
export class Action {
  /** @type {string} */
  #name;
  /** @type {string} */
  #href;
  /** @type {readonly string[] | undefined} */
  #class;
  /** @type {readonly Field[] | undefined} */
  #fields;
  /** @type {Map<string, Field>} */
  #fieldsByName = new Map();
  /** @type {string | undefined} */
  #method;
  /** @type {string | undefined} */
  #title;
  /** @type {string | undefined} */
  #type;

  /**
   * @param {string} name A name identifying the action to be performed. Must be
   *    unique within an `Entity`'s `actions`.
   * @param {string | URL} href The URI of the action. Passing a `URL` will
   *    result in the `URL`'s string representation.
   * @param {ActionOptions} options Optional members (`class`, `fields`,
   *    `method`, `title`, `type`) and extensions
   * @throws {TypeError} If `name` is not a `string` or `href` is not a valid
   *    URI
   */
  constructor(name, href, options = {}) {
    if (!isString(name)) {
      throw new TypeError('Action.name must be a string');
    }
    if (!isUri(href)) {
      throw new TypeError('Action.href must be a URI');
    }

    const { class: actionClass, fields, method, title, type, ...extensions } =
      options ?? {};

    this.#name = name;
    this.href = href;
    this.class = actionClass;
    this.fields = fields;
    this.method = method;
    this.title = title;
    this.type = type;

    extendWith(this, extensions);
  }

  /**
   * A name identifying the action to be performed. Must be unique within an
   * `Entity`'s `actions`.
   */
  get name() {
    return this.#name;
  }

  /**
   * The URI of the action. Setting to a `URL` will result in the `URL`'s string
   * representation.
   */
  get href() {
    return this.#href;
  }

  set href(value) {
    this.#href = coerce.toUriReference(value, this.href);
  }

  /**
   * A list of strings describing the nature of the `Action` based on the
   * current representation. Possible values are implementation-dependent and
   * should be documented. Setting the value to a `string` will result in a
   * singleton array.
   */
  get class() {
    return this.#class;
  }

  set class(value) {
    this.#class = coerce.toOptionalStringArray(value, this.class);
  }

  /**
   * Input controls of the `Action`
   */
  get fields() {
    return this.#fields;
  }

  set fields(value) {
    this.#fields = coerce.toUniqueSubComponents(
      value,
      this.fields,
      Field.isValid,
      Field.of
    );
    this.#fieldsByName.clear();
    this.#fields?.forEach((field) => this.#fieldsByName.set(field.name, field));
  }

  /**
   * The protocol method used when submitting the `Action`. When missing, the
   * default is assumed to be `'GET'`.
   */
  get method() {
    return this.#method;
  }

  set method(value) {
    this.#method = coerce.toOptionalString(value, this.method);
  }

  /**
   * Descriptive text about the `Action`
   */
  get title() {
    return this.#title;
  }

  set title(value) {
    this.#title = coerce.toOptionalString(value, this.title);
  }

  /**
   * The encoding type indicating how `fields` are serialized when submitting
   * the `Action`. Setting to a value that does not match the ABNF
   * `type-name "/" subtype-name` (see
   * [Section 4.2 of RFC 6838](https://tools.ietf.org/html/rfc6838#section-4.2))
   * will be ignored. When missing, the default is assumed to be
   * `'application/x-www-form-urlencoded'`.
   */
  get type() {
    return this.#type;
  }

  set type(value) {
    this.#type = coerce.toOptionalMediaTypeString(value, this.type);
  }

  /**
   * Returns the field in this `Action` with the given `name`, or `undefined`
   * if no field exists with that `name`.
   * @param {string} name Name of the field to lookup
   */
  getFieldByName(name) {
    return this.#fieldsByName.get(name);
  }

  /**
   * Customizes JSON serialization (via `JSON.stringify()`) to include
   * properties defined as getters
   */
  toJSON() {
    const {
      name,
      href,
      class: actionClass,
      fields,
      method,
      title,
      type,
      ...extensions
    } = this;
    return {
      name,
      href,
      class: actionClass,
      fields,
      method,
      title,
      type,
      ...extensions
    };
  }

  /**
   * Determines whether `value` is a parsable Siren action (i.e., can be passed
   * to `Action.of`)
   * @param {unknown} value
   * @returns {boolean}
   */
  static isValid(value) {
    return (
      value instanceof Action ||
      (isNonNullObject(value) && isString(value.name) && isUri(value.href))
    );
  }

  /**
   * Constructs a `Action` instance from any object. Use `Action.isValid`
   * beforehand to avoid unexpected behavior.
   * @param {Record<string, unknown>} value
   * @returns {Action}
   */
  static of(value) {
    if (value instanceof Action) {
      return value;
    }
    const { name, href, ...rest } = value;
    return new Action(name, href, rest);
  }
}
