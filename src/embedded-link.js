import { Link } from './link';
import * as coerce from './util/coerce';
import { isString } from './util/type-guard';

export class EmbeddedLink extends Link {
  constructor(rel, href, options = {}) {
    super(rel, href, options);

    if (this.rel.length === 0) {
      throw new TypeError('EmbeddedLink.rel must be non-empty');
    }
  }

  get rel() {
    return super.rel;
  }

  set rel(value) {
    const rel = coerce.toStringArray(value, this.rel);
    if (rel.length > 0) {
      super.rel = value;
    }
  }

  static isValid(value) {
    return (
      value instanceof EmbeddedLink ||
      (Link.isValid(value) && value.rel.filter(isString).length > 0)
    );
  }

  static of(value) {
    if (value instanceof EmbeddedLink) {
      return value;
    }
    const { rel, href, ...rest } = value;
    return new EmbeddedLink(rel, href, rest);
  }
}
