import { Action } from './action';
import { Link } from './link';
import * as coerce from './util/coerce';
import { isArray, isNullish, isRecord } from './util/type-guard';

export * from './action';
export * from './link';

export class Entity {
    #actions;
    #class;
    #links;
    #properties;
    #title;

    constructor(options = {}) {
        const { actions, class: entityClass, links, properties, title } =
            options ?? {};
        this.actions = actions;
        this.class = entityClass;
        this.links = links;
        this.properties = properties;
        this.title = title;
    }

    get actions() {
        return this.#actions;
    }

    set actions(value) {
        if (isArray(value)) {
            this.#actions = Object.freeze(
                value.filter(Action.isValid).map(Action.of)
            );
        } else if (isNullish(value)) {
            this.#actions = undefined;
        }
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
        } else if (isNullish(value)) {
            this.#links = undefined;
        }
    }

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

    get title() {
        return this.#title;
    }

    set title(value) {
        this.#title = coerce.toOptionalString(value, this.title);
    }
}
