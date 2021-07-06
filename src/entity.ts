import { Action, ActionOptions } from './action';
import { EmbeddedLink } from './embedded-link';
import { Link, LinkOptions } from './link';
import * as coerce from './util/coerce';
import { Extendable, extendWith } from './util/extend-with';
import {
  Classifiable,
  lookUpByClass,
  lookUpByRel,
  Relatable
} from './util/lookup';
import {
  isArray,
  isNullish,
  isRecord,
  isString,
  TypeGuard,
  UnknownRecord
} from './util/type-guard';

export * from './action';
export * from './embedded-link';
export * from './link';

/**
 * Represents a URI-addressable resource
 */
export class Entity<T extends UnknownRecord = UnknownRecord>
  implements Extendable {
  #actions?: readonly Action[];
  #class?: readonly string[];
  #entities?: readonly SubEntity[];
  #links?: readonly Link[];
  #properties?: T;
  #title?: string;
  #actionsByName = new Map<string, Action>();
  #actionsByClass = new Map<string, Action[]>();
  #entitiesByRel = new Map<string, SubEntity[]>();
  #entitiesByClass = new Map<string, SubEntity[]>();
  #linksByRel = new Map<string, Link[]>();
  #linksByClass = new Map<string, Link[]>();
  [extension: string]: unknown;

  /**
   * @param options Optional members (`actions`, `class`, etc.) and extensions
   */
  constructor(options: EntityOptions = {}) {
    const {
      actions,
      class: classNames,
      entities,
      links,
      properties,
      title,
      ...extensions
    } = options ?? {};

    this.actions = <readonly Action[]>actions;
    this.class = <readonly string[]>classNames;
    this.entities = <readonly SubEntity[]>entities;
    this.links = <readonly Link[]>links;
    this.properties = <T>properties;
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
      Action.of,
      this.#actionsByName,
      this.#actionsByClass
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
      SubEntityUtils.isValid,
      SubEntityUtils.of,
      this.#entitiesByRel,
      this.#entitiesByClass
    );
  }

  /**
   * Navigation links that communicate ways to navigate outside the entity graph
   */
  get links() {
    return this.#links;
  }

  set links(value) {
    this.#links = coerceSubComponents(
      value,
      this.links,
      Link.isValid,
      Link.of,
      this.#linksByRel,
      this.#linksByClass
    );
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
   * @param name Name of the action to lookup
   */
  getActionByName(name: string): Action | undefined {
    return this.#actionsByName.get(name);
  }

  /**
   * Returns the actions in this `Entity` with the given `classes`.
   * @param classes One or more classes
   */
  getActionsByClass(...classes: string[]): Action[] {
    return lookUpByClass(this.#actionsByClass, classes);
  }

  /**
   * Returns the sub-entities in this `Entity` with the given `classes`.
   * @param classes One or more classes
   */
  getEntitiesByClass(...classes: string[]): SubEntity[] {
    return lookUpByClass(this.#entitiesByClass, classes);
  }

  /**
   * Returns the sub-entities in this `Entity` with the given `rels`.
   * @param rels One or more link relation types
   */
  getEntitiesByRel(...rels: string[]): SubEntity[] {
    return lookUpByRel(this.#entitiesByRel, rels);
  }

  /**
   * Returns the links in this `Entity` with the given `classes`.
   * @param classes One or more classes
   */
  getLinksByClass(...classes: string[]): Link[] {
    return lookUpByClass(this.#linksByClass, classes);
  }

  /**
   * Returns the links in this `Entity` with the given `rels`.
   * @param rels One or more link relations
   */
  getLinksByRel(...rels: string[]): Link[] {
    return lookUpByRel(this.#linksByRel, rels);
  }

  /**
   * Customizes JSON serialization (via `JSON.stringify()`) to include
   * properties defined as getters
   */
  toJSON() {
    const {
      actions,
      class: classNames,
      entities,
      links,
      properties,
      title,
      ...extensions
    } = this;
    return {
      actions,
      class: classNames,
      entities,
      links,
      properties,
      title,
      ...extensions
    };
  }
}

function coerceSubComponents<T extends Classifiable & Relatable>(
  values: readonly unknown[] | undefined,
  defaultValue: readonly T[] | undefined,
  isValid: TypeGuard<UnknownRecord>,
  parse: (value: UnknownRecord) => T,
  relIndex: Map<string, T[]>,
  classIndex: Map<string, T[]>
): readonly T[] | undefined {
  if (isArray(values)) {
    relIndex.clear();
    classIndex.clear();
    const components = [];
    for (const value of values) {
      if (isValid(value)) {
        const component = parse(value);
        components.push(component);
        component.rel.forEach((rel) => {
          append(relIndex, rel.toLowerCase(), component);
        });
        component.class?.forEach((className) => {
          append(classIndex, className, component);
        });
      }
    }
    return Object.freeze(components);
  } else if (isNullish(values)) {
    relIndex.clear();
    classIndex.clear();
    return undefined;
  } else {
    return defaultValue;
  }
}

function append<T>(map: Map<string, T[]>, key: string, value: T) {
  const values = map.get(key) ?? [];
  values.push(value);
  map.set(key, values);
}

/**
 * Represents a sub-entity as an embedded representation
 */
export class EmbeddedEntity extends Entity {
  #rel: readonly string[] = [];

  /**
   * @param rel A list of strings describing the relationship of the sub-entity
   *    to its parent `Entity`, per
   *    [RFC 8288](https://tools.ietf.org/html/rfc8288). Passing a `string` will
   *    result in a singleton array.
   * @param options Optional members (`actions`, `class`, etc.) and extensions
   */
  constructor(rel: string | readonly string[], options: EntityOptions = {}) {
    super(options);

    if (!isString(rel) && !isArray(rel)) {
      throw new TypeError('EmbeddedEntity.rel must be an array of strings');
    }

    this.rel = <readonly string[]>rel;
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
   */
  static isValid(value: unknown): value is UnknownRecord {
    return (
      value instanceof EmbeddedEntity ||
      (isRecord(value) && (isArray(value.rel) || isString(value.rel)))
    );
  }

  /**
   * Constructs a `EmbeddedEntity` instance from any object. Use
   * `EmbeddedEntity.isValid` beforehand to avoid unexpected behavior.
   */
  static of(value: UnknownRecord): EmbeddedEntity {
    if (value instanceof EmbeddedEntity) {
      return value;
    }
    const { rel, ...rest } = value;
    return new EmbeddedEntity(<readonly string[]>rel, rest);
  }
}

export type SubEntity = EmbeddedEntity | EmbeddedLink;

/**
 * Utility class for validating and parsing sub-entities
 */
class SubEntityUtils {
  private constructor() {}

  /**
   * Determines whether `value` is a parsable Siren sub-entity (i.e., can be
   * passed to `SubEntity.of`)
   */
  static isValid(value: unknown): value is UnknownRecord {
    return EmbeddedLink.isValid(value) || EmbeddedEntity.isValid(value);
  }

  /**
   * Constructs a `SubEntity` instance from any object. Use `SubEntity.isValid`
   * beforehand to avoid unexpected behavior.
   */
  static of(value: UnknownRecord): SubEntity {
    return EmbeddedLink.isValid(value)
      ? EmbeddedLink.of(value)
      : EmbeddedEntity.of(value);
  }
}

/**
 * Optional `Entity` members and extensions
 */
export interface EntityOptions<T extends UnknownRecord = UnknownRecord>
  extends Extendable {
  /**
   * Available behavior exposed by the `Entity`
   */
  actions?: readonly ActionOption[];
  /**
   * A list of strings describing the nature of the `Entity` based on the
   * current representation. Possible values are implementation-dependent and
   * should be documented. Setting the value to a `string` will result in a
   * singleton array.
   */
  class?: string | readonly string[];
  /**
   * Related entities represented as embedded links or representations
   */
  entities?: readonly SubEntityOption[];
  /**
   * Navigation links that communicate ways to navigate outside the entity graph
   */
  links?: readonly LinkOption[];
  /**
   * Key-value pairs describing the state of the `Entity`
   */
  properties?: T;
  /**
   * Descriptive text about the `Entity`
   */
  title?: string;
}

export interface ActionOption extends ActionOptions {
  /**
   * A name identifying the action to be performed. Must be unique within an
   * `Entity`'s `actions`.
   */
  name: string;
  /**
   * The URI of the action. Setting to a `URL` will result in the `URL`'s string
   * representation.
   */
  href: string | URL;
}

export type SubEntityOption = EmbeddedLinkOption | EmbeddedEntityOption;

export type EmbeddedLinkOption = LinkOption;

export interface EmbeddedEntityOption extends EntityOptions {
  /**
   * A list of strings describing the relationship of the sub-entity to its
   * parent `Entity`, per [RFC 8288](https://tools.ietf.org/html/rfc8288).
   * Setting to a `string` will result in a singleton array.
   */
  rel: string | readonly string[];
}

export interface LinkOption extends LinkOptions {
  /**
   * A list of strings describing the relationship of the link to its
   * `Entity`, per [RFC 8288](https://tools.ietf.org/html/rfc8288). Setting the
   * value to a `string` will result in a singleton array.
   */
  rel: string | readonly string[];
  /**
   * The URI of the linked resource. Setting the value to a `URL` will result in
   * the `URL`'s string representation.
   */
  href: string | URL;
}
