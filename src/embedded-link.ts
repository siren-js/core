import { Link, LinkOptions } from './link';
import * as coerce from './util/coerce';
import { UnknownRecord } from './util/type-guard';

/**
 * Represent a sub-entity as a link
 */
export class EmbeddedLink extends Link {
  /**
   * @param rel A list of strings describing the relationship of the sub-entity
   *    to its parent `Entity`, per
   *    [RFC 8288](https://tools.ietf.org/html/rfc8288). Passing a `string` will
   *    result in a singleton array.
   * @param href The URI of the linked resource. Passing a `URL` will result in
   *    the `URL`'s string representation.
   * @param options Optional members (`class`, `title`, `type`) and extensions
   * @throws {TypeError} If `rel` is not a `string` or non-empty `string[]` or
   *    `href` is not a valid URI
   */
  constructor(
    rel: string | readonly string[],
    href: string | URL,
    options: EmbeddedLinkOptions = {}
  ) {
    super(rel, href, options);

    if (this.rel.length === 0) {
      throw new TypeError('EmbeddedLink.rel must be non-empty');
    }
  }

  /**
   * A list of strings describing the relationship of the sub-entity to its
   * parent `Entity`, per [RFC 8288](https://tools.ietf.org/html/rfc8288).
   * Setting to a `string` will result in a singleton array. Empty arrays are
   * ignored.
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
   */
  static isValid(value: unknown): value is UnknownRecord {
    return (
      value instanceof EmbeddedLink ||
      (Link.isValid(value) && coerce.toStringArray(value.rel, []).length > 0)
    );
  }

  /**
   * Constructs a `EmbeddedLink` instance from any object. Use
   * `EmbeddedLink.isValid` beforehand to avoid unexpected behavior.
   */
  static of(value: UnknownRecord): EmbeddedLink {
    if (value instanceof EmbeddedLink) {
      return value;
    }
    const { rel, href, ...rest } = value;
    return new EmbeddedLink(<readonly string[]>rel, <string>href, rest);
  }
}

/**
 * Optional `EmbeddedLink` members and extensions
 */
export type EmbeddedLinkOptions = LinkOptions;
