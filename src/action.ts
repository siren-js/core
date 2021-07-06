import { Field } from './field';
import * as coerce from './util/coerce';
import { Extendable, extendWith } from './util/extend-with';
import { lookUpByClass } from './util/lookup';
import { isRecord, isString, isUri, UnknownRecord } from './util/type-guard';

export * from './field';

/**
 * Represents available behavior exposed by an `Entity`.
 */
export class Action implements Extendable {
  #name = '';
  #href = '';
  #class?: readonly string[];
  #fields?: readonly Field[];
  #method?: string;
  #title?: string;
  #type?: string;
  #fieldsByName = new Map<string, Field>();
  #fieldsByClass = new Map<string, Field[]>();
  [extension: string]: unknown;

  /**
   * @param name A name identifying the action to be performed. Must be unique
   *    within an `Entity`'s `actions`.
   * @param href The URI of the action. Passing a `URL` will result in the
   *    `URL`'s string representation.
   * @param options Optional members (`class`, `fields`, etc.) and extensions
   * @throws {TypeError} If `name` is not a `string` or `href` is not a valid
   *    URI
   */
  constructor(name: string, href: string | URL, options: ActionOptions = {}) {
    if (!isString(name)) {
      throw new TypeError('Action.name must be a string');
    }
    if (!isUri(href)) {
      throw new TypeError('Action.href must be a URI');
    }

    const { class: classNames, fields, method, title, type, ...extensions } =
      options ?? {};

    this.#name = name;
    this.href = href;
    this.class = <string[]>classNames;
    this.fields = <Field[]>fields;
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
      Field.of,
      this.#fieldsByName,
      this.#fieldsByClass
    );
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
   * @param name Name of the field to lookup
   */
  getFieldByName(name: string): Field | undefined {
    return this.#fieldsByName.get(name);
  }

  /**
   * Returns the fields in this `Action` with the given `classes`.
   * @param classes One or more classes
   */
  getFieldsByClass(...classes: string[]): Field[] {
    return lookUpByClass(this.#fieldsByClass, classes);
  }

  /**
   * Customizes JSON serialization (via `JSON.stringify()`) to include
   * properties defined as getters
   */
  toJSON() {
    const {
      name,
      href,
      class: classNames,
      fields,
      method,
      title,
      type,
      ...extensions
    } = this;
    return {
      name,
      href,
      class: classNames,
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
   */
  static isValid(value: unknown): value is UnknownRecord {
    return (
      value instanceof Action ||
      (isRecord(value) && isString(value.name) && isUri(value.href))
    );
  }

  /**
   * Constructs a `Action` instance from any object. Use `Action.isValid`
   * beforehand to avoid unexpected behavior.
   */
  static of(value: UnknownRecord): Action {
    if (value instanceof Action) {
      return value;
    }
    const { name, href, ...rest } = value;
    return new Action(<string>name, <string>href, rest);
  }
}

/**
 * Optional `Action` members and extensions
 */
export interface ActionOptions extends Extendable {
  /**
   * A list of strings describing the nature of the `Action` based on the
   * current representation. Possible values are implementation-dependent and
   * should be documented. Setting the value to a `string` will result in a
   * singleton array.
   */
  class?: string | readonly string[];
  /**
   * Input controls of the `Action`
   */
  fields?: readonly FieldOption[];
  /**
   * The protocol method used when submitting the `Action`
   */
  method?: string;
  /**
   * Descriptive text about the `Action`
   */
  title?: string;
  /**
   * The encoding type indicating how `fields` are serialized when submitting
   * the `Action`. Setting to a value that does not match the ABNF
   * `type-name "/" subtype-name` (see
   * [Section 4.2 of RFC 6838](https://tools.ietf.org/html/rfc6838#section-4.2))
   * will be ignored.
   */
  type?: string;
}

export interface FieldOption<T = unknown> extends Extendable {
  /**
   * A name describing the control. Must be unique within an `Action`.
   */
  name: string;
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
