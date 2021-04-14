import { Action } from './action';
import { EmbeddedLink } from './embedded-link';
import { Link } from './link';
import * as coerce from './util/coerce';
import extendWith from './util/extend-with';
import {
  isArray,
  isNonNullObject,
  isNullish,
  isRecord,
  isString
} from './util/type-guard';

export * from './action';
export * from './embedded-link';
export * from './link';

/**
 * Represents a URI-addressable resource
 */
export class Entity {
  /** @type {readonly Action[] | undefined} */
  #actions;
  /** @type {Map<string, Action>} */
  #actionsByName = new Map();
  /** @type {readonly string[] | undefined} */
  #class;
  /** @type {readonly SubEntity[] | undefined} */
  #entities;
  /** @type {readonly Link[] | undefined} */
  #links;
  /** @type {Record<string, unknown> | undefined} */
  #properties;
  /** @type {string | undefined} */
  #title;

  /**
   * @param {EntityOptions} options Optional members (`actions`, `class`,
   *    `entities`, `links`, `properties`, `title`) and extensions
   */
  constructor(options = {}) {
    const {
      actions,
      class: entityClass,
      entities,
      links,
      properties,
      title,
      ...extensions
    } = options ?? {};

    this.actions = actions;
    this.class = entityClass;
    this.entities = entities;
    this.links = links;
    this.properties = properties;
    this.title = title;

    extendWith(this, extensions);
  }

  /**
   * Available behavior exposed by the `Entity`
   */
  get actions() {
    return this.#actions;
  }

  set actions(value) {
    this.#actions = coerce.toUniqueSubComponents(
      value,
      this.actions,
      Action.isValid,
      Action.of
    );
    this.#actionsByName.clear();
    this.#actions?.forEach((action) =>
      this.#actionsByName.set(action.name, action)
    );
  }

  /**
   * A list of strings describing the nature of the `Entity` based on the
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
   * Related entities represented as embedded links or representations
   */
  get entities() {
    return this.#entities;
  }

  set entities(value) {
    this.#entities = coerceSubComponents(
      value,
      this.entities,
      SubEntity.isValid,
      SubEntity.of
    );
  }

  /**
   * Navigation links that communicate ways to navigate outside the entity graph
   */
  get links() {
    return this.#links;
  }

  set links(value) {
    this.#links = coerceSubComponents(value, this.links, Link.isValid, Link.of);
  }

  /**
   * Key-value pairs describing the state of the `Entity`
   */
  get properties() {
    return this.#properties;
  }

  set properties(value) {
    if (isRecord(value)) {
      this.#properties = value;
    } else if (isNullish(value)) {
      this.#properties = undefined;
    }
  }

  /**
   * Descriptive text about the `Entity`
   */
  get title() {
    return this.#title;
  }

  set title(value) {
    this.#title = coerce.toOptionalString(value, this.title);
  }

  /**
   * Returns the action in this `Entity` with the given `name`, or `undefined`
   * if no action exists with that `name`.
   * @param {string} name Name of the action to lookup
   */
  getActionByName(name) {
    return this.#actionsByName.get(name);
  }

  /**
   * Customizes JSON serialization (via `JSON.stringify()`) to include
   * properties defined as getters
   */
  toJSON() {
    const {
      actions,
      class: entityClass,
      entities,
      links,
      properties,
      title,
      ...extensions
    } = this;
    return {
      actions,
      class: entityClass,
      entities,
      links,
      properties,
      title,
      ...extensions
    };
  }
}

function coerceSubComponents(value, defaultValue, validator, factory) {
  if (isArray(value)) {
    return Object.freeze(value.filter(validator).map(factory));
  } else if (isNullish(value)) {
    return undefined;
  } else {
    return defaultValue;
  }
}

/**
 * Represents a sub-entity as an embedded representation
 */
export class EmbeddedEntity extends Entity {
  /** @type {readonly string[]} */
  #rel;

  /**
   * @param {string | readonly string[]} rel A list of strings describing the
   *    relationship of the sub-entity to its parent `Entity`, per
   *    [RFC 8288](https://tools.ietf.org/html/rfc8288). Passing a `string` will
   *    result in a singleton array.
   * @param {EntityOptions} options Optional members (`actions`, `class`,
   *    `entities`, `links`, `properties`, `title`) and extensions
   */
  constructor(rel, options = {}) {
    super(options);

    if (!isString(rel) && !isArray(rel)) {
      throw new TypeError('EmbeddedEntity.rel must be an array of strings');
    }

    this.rel = rel;
  }

  /**
   * A list of strings describing the relationship of the sub-entity to its
   * parent `Entity`, per [RFC 8288](https://tools.ietf.org/html/rfc8288).
   * Setting to a `string` will result in a singleton array. Empty arrays are
   * ignored.
   */
  get rel() {
    return this.#rel;
  }

  set rel(value) {
    this.#rel = coerce.toStringArray(value, this.rel);
  }

  /**
   * Customizes JSON serialization (via `JSON.stringify()`) to include
   * properties defined as getters
   */
  toJSON() {
    return { rel: this.rel, ...super.toJSON() };
  }

  /**
   * Determines whether `value` is a parsable Siren embedded representation
   * (i.e., can be passed to `EmbeddedEntity.of`)
   * @param {unknown} value
   * @returns {boolean}
   */
  static isValid(value) {
    return (
      value instanceof EmbeddedEntity ||
      (isNonNullObject(value) && (isArray(value.rel) || isString(value.rel)))
    );
  }

  /**
   * Constructs a `EmbeddedEntity` instance from any object. Use
   * `EmbeddedEntity.isValid` beforehand to avoid unexpected behavior.
   * @param {Record<string, unknown>} value
   * @returns {EmbeddedEntity}
   */
  static of(value) {
    if (value instanceof EmbeddedEntity) {
      return value;
    }
    const { rel, ...rest } = value;
    return new EmbeddedEntity(rel, rest);
  }
}

/**
 * Represents a sub-entity embedded in another `Entity`
 */
export class SubEntity {
  /**
   * Determines whether `value` is a parsable Siren sub-entity (i.e., can be
   * passed to `SubEntity.of`)
   * @param {unknown} value
   * @returns {boolean}
   */
  static isValid(value) {
    return EmbeddedLink.isValid(value) || EmbeddedEntity.isValid(value);
  }

  /**
   * Constructs a `SubEntity` instance from any object. Use `SubEntity.isValid`
   * beforehand to avoid unexpected behavior.
   * @param {Record<string, unknown>} value
   * @returns {SubEntity}
   */
  static of(value) {
    return EmbeddedLink.isValid(value)
      ? EmbeddedLink.of(value)
      : EmbeddedEntity.of(value);
  }
}

/**
 * @typedef EntityOptions Optional `Entity` members and extensions
 * @property {readonly ActionOption[]} [actions] Available behavior exposed by
 *    the `Entity`
 * @property {string | readonly string[]} [class] A list of strings describing
 *    the nature of the `Entity` based on the current representation. Possible
 *    values are implementation-dependent and should be documented. Setting the
 *    value to a `string` will result in a singleton array.
 * @property {readonly SubEntityOption[]} [entities] Related entities
 *    represented as embedded links or representations
 * @property {readonly LinkOption[]} [links] Navigation links that communicate
 *    ways to navigate outside the entity graph
 * @property {Record<string, unknown>} [properties] Key-value pairs describing
 *    the state of the `Entity`
 * @property {string} [title] Descriptive text about the `Entity`
 *
 * @typedef ActionOption
 * @property {string} name
 * @property {string} href
 * @property {string | readonly string[]} [class] A list of strings describing
 *    the nature of the `Action` based on the current representation. Possible
 *    values are implementation-dependent and should be documented. Setting the
 *    value to a `string` will result in a singleton array.
 * @property {readonly FieldOption[]} [fields] Input controls of the `Action`
 * @property {string} [method] The protocol method used when submitting the
 *    `Action`
 * @property {string} [title] Descriptive text about the `Action`
 * @property {string} [type] The encoding type indicating how `fields` are
 *    serialized when submitting the `Action`. Setting to
 *    a value that does not match the ABNF `type-name "/" subtype-name` (see
 *    [Section 4.2 of RFC 6838](https://tools.ietf.org/html/rfc6838#section-4.2))
 *    will be ignored.
 *
 * @typedef {EmbeddedLinkOption | EmbeddedEntityOption} SubEntityOption
 *
 * @typedef EmbeddedLinkOption
 * @property {string | readonly string[]} rel A list of strings describing the
 *    relationship of the sub-entity to its parent `Entity`, per
 *    [RFC 8288](https://tools.ietf.org/html/rfc8288). Setting to a `string`
 *    will result in a singleton array. An empty array will result in the entire
 *    object being ignored.
 * @property {string} href The URI of the linked resource. Setting the value to
 *    a `URL` will result in the `URL`'s string representation.
 * @property {string | readonly string[]} [class] A list of strings describing
 *    the nature of the `Link` based on the current representation. Possible
 *    values are implementation-dependent and should be documented. Setting the
 *    value to a `string` will result in a singleton array.
 * @property {string} [title] Text describing the nature of the `Link`
 * @property {string} [type] A hint indicating what the media type of the result
 *    of dereferencing the `Link` should be, per
 *    [RFC 8288](https://tools.ietf.org/html/rfc8288#section-3.4.1). Setting to
 *    a value that does not match the ABNF `type-name "/" subtype-name` (see
 *    [Section 4.2 of RFC 6838](https://tools.ietf.org/html/rfc6838#section-4.2))
 *    will be ignored.
 *
 * @typedef EmbeddedEntityOption
 * @property {string | readonly string[]} rel A list of strings describing the
 *    relationship of the sub-entity to its parent `Entity`, per
 *    [RFC 8288](https://tools.ietf.org/html/rfc8288). Setting to a `string`
 *    will result in a singleton array.
 * @property {readonly ActionOption[]} [actions] Available behavior exposed by
 *    the `Entity`
 * @property {string | readonly string[]} [class] A list of strings describing
 *    the nature of the `Entity` based on the current representation. Possible
 *    values are implementation-dependent and should be documented. Setting the
 *    value to a `string` will result in a singleton array.
 * @property {readonly SubEntityOption[]} [entities] Related entities
 *    represented as embedded links or representations
 * @property {readonly LinkOption[]} [links] Navigation links that communicate
 *    ways to navigate outside the entity graph
 * @property {Record<string, unknown>} [properties] Key-value pairs describing
 *    the state of the `Entity`
 * @property {string} [title] Descriptive text about the `Entity`
 *
 * @typedef LinkOption
 * @property {string | readonly string[]} rel A list of strings describing the
 *    relationship of the `Link` to its `Entity`, per
 *    [RFC 8288](https://tools.ietf.org/html/rfc8288). Setting the value to a
 *    `string` will result in a singleton array.
 * @property {string} href The URI of the linked resource. Setting the value to
 *    a `URL` will result in the `URL`'s string representation.
 * @property {string | readonly string[]} [class] A list of strings describing
 *    the nature of the `Link` based on the current representation. Possible
 *    values are implementation-dependent and should be documented. Setting the
 *    value to a `string` will result in a singleton array.
 * @property {string} [title] Text describing the nature of the `Link`
 * @property {string} [type] A hint indicating what the media type of the result
 *    of dereferencing the `Link` should be, per
 *    [RFC 8288](https://tools.ietf.org/html/rfc8288#section-3.4.1). Setting to
 *    a value that does not match the ABNF `type-name "/" subtype-name` (see
 *    [Section 4.2 of RFC 6838](https://tools.ietf.org/html/rfc6838#section-4.2))
 *    will be ignored.
 */
