import * as coerce from './util/coerce';
import extendWith from './util/extend-with';
import { isArray, isNonNullObject, isString, isUri } from './util/type-guard';

/**
 * @typedef {object} LinkOptions Optional `Link` members and extensions
 * @property {string | readonly string[]} [class] A list of strings describing
 *    aspects of the `Link` based on the current representation. Possible values
 *    are implementation-dependent and should be documented. Setting the value
 *    to a `string` will result in a singleton array.
 * @property {string} [title] Text describing the nature of the `Link`
 * @property {string} [type] A hint indicating what the media type of the result
 *    of dereferencing the `Link` should be, per
 *    [RFC 8288](https://tools.ietf.org/html/rfc8288#section-3.4.1). Setting to
 *    a value that does not match the ABNF `type-name "/" subtype-name` (see
 *    [Section 4.2 of RFC 6838](https://tools.ietf.org/html/rfc6838#section-4.2))
 *    will be ignored.
 */

/**
 * Represents a navigational transition.
 */
export class Link {
  #rel;
  #href;
  #class;
  #title;
  #type;

  /**
   * @param {string | readonly string[]} rel A list of strings describing the
   *    relationship of the `Link` to its `Entity`, per
   *    [RFC 8288](https://tools.ietf.org/html/rfc8288). Passing a `string` will
   *    result in a singleton array.
   * @param {string | URL} href The URI of the linked resource. Passing a `URL`
   *    will result in the `URL`'s string representation.
   * @param {LinkOptions} options Optional members (`class`, `title`, `type`)
   *    and extensions
   * @throws {TypeError} If `rel` is not a `string` or `string[]` or `href` is
   *    not a valid URI
   */
  constructor(rel, href, options = {}) {
    if (!isString(rel) && !isArray(rel)) {
      throw new TypeError('Link.rel must be an array of strings');
    }
    if (!isUri(href)) {
      throw new TypeError('Link.href must be a URI');
    }

    const { class: linkClass, title, type, ...extensions } = options ?? {};

    this.rel = rel;
    this.href = href;
    this.class = linkClass;
    this.title = title;
    this.type = type;

    extendWith(this, extensions);
  }

  /**
   * A list of strings describing the relationship of the `Link` to its
   * `Entity`, per [RFC 8288](https://tools.ietf.org/html/rfc8288). Setting the
   * value to a `string` will result in a singleton array.
   * @type {readonly string[]}
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
   * @type {string}
   */
  get href() {
    return this.#href;
  }

  set href(value) {
    this.#href = coerce.toUriReference(value, this.href);
  }

  /**
   * A list of strings describing aspects of the `Link` based on the current
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
   * Text describing the nature of a link
   * @type {string}
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
   * @type {string}
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
    const { rel, href, class: linkClass, title, type, ...extensions } = this;
    return { rel, href, class: linkClass, title, type, ...extensions };
  }

  /**
   * Determines whether `value` is a parsable Siren link (i.e., can be passed
   * to `Link.of`)
   * @param {unknown} value
   * @returns {boolean}
   */
  static isValid(value) {
    return (
      value instanceof Link ||
      (isNonNullObject(value) &&
        (isArray(value.rel) || isString(value.rel)) &&
        isUri(value.href))
    );
  }

  /**
   * Constructs a `Link` instance from any object. Use `Link.isValid` beforehand
   * to avoid unexpected behavior.
   * @param {Record<string, unknown>} value
   * @returns {Link}
   */
  static of(value) {
    if (value instanceof Link) {
      return value;
    }
    const { rel, href, ...rest } = value;
    return new Link(rel, href, rest);
  }
}
