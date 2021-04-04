import { Link } from './link';
import * as coerce from './util/coerce';
import { isString } from './util/type-guard';

/**
 * @typedef {import('./link').LinkOptions} EmbeddedLinkOptions
 */

/**
 * Represent a sub-entity as a link
 */
export class EmbeddedLink extends Link {
  /**
   * @param {string | readonly string[]} rel A list of strings describing the
   *    relationship of the sub-entity to its parent `Entity`, per
   *    [RFC 8288](https://tools.ietf.org/html/rfc8288). Passing a `string` will
   *    result in a singleton array.
   * @param {string | URL} href The URI of the linked resource. Passing a `URL`
   *    will result in the `URL`'s string representation.
   * @param {EmbeddedLinkOptions} options Optional members (`class`, `title`,
   *    `type`) and extensions
   * @throws {TypeError} If `rel` is not a `string` or `string[]` or `href` is
   *    not a valid URI
   */
  constructor(rel, href, options = {}) {
    super(rel, href, options);

    if (this.rel === undefined) {
      throw new TypeError('EmbeddedLink.rel must be non-empty');
    }
  }

  /**
   * A list of strings describing the relationship of the sub-entity to its
   * parent `Entity`, per [RFC 8288](https://tools.ietf.org/html/rfc8288).
   * Setting to a `string` will result in a singleton array. Empty arrays are
   * ignored.
   * @type {readonly string[]}
   */
  get rel() {
    return super.rel;
  }

  set rel(value) {
    const rel = coerce.toStringArray(value, this.rel);
    if (rel.length > 0) {
      super.rel = value;
    }
  }

  /**
   * Determines whether `value` is a parsable Siren embedded link (i.e., can be
   * passed to `EmbeddedLink.of`)
   * @param {unknown} value
   * @returns {boolean}
   */
  static isValid(value) {
    return (
      value instanceof EmbeddedLink ||
      (Link.isValid(value) && coerce.toStringArray(value.rel, []).length > 0)
    );
  }

  /**
   * Constructs a `EmbeddedLink` instance from any object. Use
   * `EmbeddedLink.isValid` beforehand to avoid unexpected behavior.
   * @param {Record<string, unknown>} value
   * @returns {EmbeddedLink}
   */
  static of(value) {
    if (value instanceof EmbeddedLink) {
      return value;
    }
    const { rel, href, ...rest } = value;
    return new EmbeddedLink(rel, href, rest);
  }
}
