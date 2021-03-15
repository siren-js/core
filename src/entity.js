import { Link } from './link';
import * as coerce from './util/coerce';
import { isArray, isRecord } from './util/type-guard';

export * from './link';

export class Entity {
    #class;
    #links;
    #properties;

    constructor(options = {}) {
        const { class: entityClass, links, properties } = options ?? {};
        this.class = entityClass;
        this.links = links;
        this.properties = properties;
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

    get properties() {
        return this.#properties;
    }

    set properties(value) {
        if (isRecord(value)) {
            this.#properties = value;
        }
    }
}
