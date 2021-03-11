import { Link } from './link';
import * as coerce from './util/coerce';
import { isArray } from './util/type-guard';

export * from './link';

export class Entity {
    #class;
    #links;

    constructor(options = {}) {
        const { class: entityClass, links } = options ?? {};
        this.class = entityClass;
        this.links = links;
    }

    get class() {
        return this.#class;
    }

    set class(value) {
        this.#class = coerce.toOptionalStringArray(value, this.class);
    }

    get links() {
        return this.#links;
    }

    set links(value) {
        if (isArray(value)) {
            this.#links = Object.freeze(
                value.filter(Link.isValid).map(Link.of)
            );
        }
    }
}
