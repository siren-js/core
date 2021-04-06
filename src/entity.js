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
 * @typedef {object} EntityOptions Optional `Entity` members and extensions
 * @property {readonly Action[]} [actions] Available behavior exposed by the
 *    `Entity`
 * @property {string | readonly string[]} [class] A list of strings describing
 *    the nature of the `Entity` based on the current representation. Possible
 *    values are implementation-dependent and should be documented. Setting the
 *    value to a `string` will result in a singleton array.
 * @property {readonly SubEntity[]} [entities] Related entities represented as
 *    embedded links or representations
 * @property {readonly Link[]} [links] Navigation links that communicate ways to
 *    navigate outside the entity graph
 * @property {Record<string, unknown>} [properties] Key-value pairs describing
 *    the state of the `Entity`
 * @property {string} [title] Descriptive text about the `Entity`
 */

/**
 * Represents a URI-addressable resource
 */
export class Entity {
  #actions;
  #class;
  #entities;
  #links;
  #properties;
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
   * @type {readonly string[] | undefined}
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
  }

  /**
   * A list of strings describing the nature of the `Entity` based on the
   * current representation. Possible values are implementation-dependent and
   * should be documented. Setting the value to a `string` will result in a
   * singleton array.
   * @type {readonly string[] | undefined}
   */
  get class() {
    return this.#class;
  }

  set class(value) {
    this.#class = coerce.toOptionalStringArray(value, this.class);
  }

  /**
   * Related entities represented as embedded links or representations
   * @type {readonly SubEntity[] | undefined}
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
   * @type {readonly Link[] | undefined}
   */
  get links() {
    return this.#links;
  }

  set links(value) {
    this.#links = coerceSubComponents(value, this.links, Link.isValid, Link.of);
  }

  /**
   * Key-value pairs describing the state of the `Entity`
   * @type {Record<string, unknown> | undefined}
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
   * @type {string | undefined}
   */
  get title() {
    return this.#title;
  }

  set title(value) {
    this.#title = coerce.toOptionalString(value, this.title);
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
   * @type {readonly string[]}
   */
  get rel() {
    return this.#rel;
  }

  set rel(value) {
    this.#rel = coerce.toStringArray(value, this.rel);
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
