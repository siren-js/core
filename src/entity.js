import { Link } from './link';
import { isArray } from './util/type-guard';

export * from './link';

export class Entity {
    #links;

    constructor(options = {}) {
        const { links } = options ?? {};
        this.links = links;
    }

    get links() {
        return this.#links;
    }

    set links(value) {
        if (isArray(value)) {
            this.#links = Object.freeze(value.filter(Link.isValid).map(Link.of));
        }
    }
}
