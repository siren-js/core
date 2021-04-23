import * as coerce from './util/coerce';
import { Extendable, extendWith } from './util/extend-with';
import {
  isArray,
  isRecord,
  isString,
  isUri,
  UnknownRecord
} from './util/type-guard';

/**
 * Represents a navigational transition.
 */
export class Link implements Extendable {
  #rel: readonly string[] = [];
  #href = '';
  #class?: readonly string[];
  #title?: string;
  #type?: string;
  [extension: string]: unknown;

  /**
   * @param rel A list of strings describing the relationship of the `Link` to
   *    its `Entity`, per [RFC 8288](https://tools.ietf.org/html/rfc8288).
   *    Passing a `string` will result in a singleton array.
   * @param href The URI of the linked resource. Passing a `URL` will result in
   *    the `URL`'s string representation.
   * @param options Optional members (`class`, `title`, `type`) and extensions
   * @throws {TypeError} If `rel` is not a `string` or `string[]` or `href` is
   *    not a valid URI
   */
  constructor(
    rel: string | readonly string[],
    href: string | URL,
    options: LinkOptions = {}
  ) {
    if (!isString(rel) && !isArray(rel)) {
      throw new TypeError('Link.rel must be an array of strings');
    }
    if (!isUri(href)) {
      throw new TypeError('Link.href must be a URI');
    }

    const { class: classNames, title, type, ...extensions } = options ?? {};

    this.rel = <readonly string[]>rel;
    this.href = href;
    this.class = <readonly string[]>classNames;
    this.title = title;
    this.type = type;

    extendWith(this, extensions);
  }

  /**
   * A list of strings describing the relationship of the `Link` to its
   * `Entity`, per [RFC 8288](https://tools.ietf.org/html/rfc8288). Setting the
   * value to a `string` will result in a singleton array.
   */
  get rel() {
    return this.#rel;
  }

  set rel(value) {
    this.#rel = coerce.toStringArray(value, this.rel);
  }

  /**
   * The URI of the linked resource. Setting the value to a `URL` will result in
   * the `URL`'s string representation.
   */
  get href() {
    return this.#href;
  }

  set href(value) {
    this.#href = coerce.toUriReference(value, this.href);
  }

  /**
   * A list of strings describing the nature of the `Link` based on the current
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
   * Text describing the nature of a link
   */
  get title() {
    return this.#title;
  }

  set title(value) {
    this.#title = coerce.toOptionalString(value, this.title);
  }

  /**
   * A hint indicating what the media type of the result of dereferencing the
   * `Link` should be, per
   * [RFC 8288](https://tools.ietf.org/html/rfc8288#section-3.4.1). Setting to a
   * value that does not match the ABNF `type-name "/" subtype-name` (see
   * [Section 4.2 of RFC 6838](https://tools.ietf.org/html/rfc6838#section-4.2))
   * will be ignored.
   */
  get type() {
    return this.#type;
  }

  set type(value) {
    this.#type = coerce.toOptionalMediaTypeString(value, this.type);
  }

  /**
   * Customizes JSON serialization (via `JSON.stringify()`) to include
   * properties defined as getters
   */
  toJSON() {
    const { rel, href, class: classNames, title, type, ...extensions } = this;
    return { rel, href, class: classNames, title, type, ...extensions };
  }

  /**
   * Determines whether `value` is a parsable Siren link (i.e., can be passed
   * to `Link.of`)
   */
  static isValid(value: unknown): value is UnknownRecord {
    return (
      value instanceof Link ||
      (isRecord(value) &&
        (isArray(value.rel) || isString(value.rel)) &&
        isUri(value.href))
    );
  }

  /**
   * Constructs a `Link` instance from any object. Use `Link.isValid` beforehand
   * to avoid unexpected behavior.
   */
  static of(value: UnknownRecord): Link {
    if (value instanceof Link) {
      return value;
    }
    const { rel, href, ...rest } = value;
    return new Link(<readonly string[]>rel, <string>href, rest);
  }
}

/**
 * Optional `Link` members and extensions
 */
export interface LinkOptions extends Extendable {
  /**
   * A list of strings describing the nature of the `Link` based on the current
   * representation. Possible values are implementation-dependent and should be
   * documented. Setting the value to a `string` will result in a singleton
   * array.
   */
  class?: string | readonly string[];
  /**
   * Text describing the nature of the `Link`
   */
  title?: string;
  /**
   * A hint indicating what the media type of the result of dereferencing the
   * `Link` should be, per
   * [RFC 8288](https://tools.ietf.org/html/rfc8288#section-3.4.1). Setting to a
   * value that does not match the ABNF `type-name "/" subtype-name` (see
   * [Section 4.2 of RFC 6838](https://tools.ietf.org/html/rfc6838#section-4.2))
   * will be ignored.
   */
  type?: string;
}
