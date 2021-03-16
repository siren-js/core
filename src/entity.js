import { Action } from './action';
import { EmbeddedLink } from './embedded-link';
import { Link } from './link';
import * as coerce from './util/coerce';
import {
    isArray,
    isNonNullObject,
    isNullish,
    isRecord,
    isString
} from './util/type-guard';

export * from './action';
export * from './embedded-link';
export * from './link';

export class Entity {
    #actions;
    #class;
    #entities;
    #links;
    #properties;
    #title;

    constructor(options = {}) {
        const {
            actions,
            class: entityClass,
            entities,
            links,
            properties,
            title,
            ...extensions
        } = options ?? {};

        this.actions = actions;
        this.class = entityClass;
        this.entities = entities;
        this.links = links;
        this.properties = properties;
        this.title = title;

        Object.keys(extensions).forEach((key) => {
            this[key] = extensions[key];
        });
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

    get entities() {
        return this.#entities;
    }

    set entities(value) {
        if (isArray(value)) {
            this.#entities = Object.freeze(
                value.filter(SubEntity.isValid).map(SubEntity.of)
            );
        } else if (isNullish(value)) {
            this.#entities = undefined;
        }
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

    toJSON() {
        const {
            actions,
            class: entityClass,
            entities,
            links,
            properties,
            title,
            ...extensions
        } = this;
        return {
            actions,
            class: entityClass,
            entities,
            links,
            properties,
            title,
            ...extensions
        };
    }
}

export class EmbeddedRepresentation extends Entity {
    #rel;

    constructor(rel, options = {}) {
        super(options);
        if (!isString(rel) && !isArray(rel)) {
            throw new TypeError(
                'EmbeddedRepresentation.rel must be an array of strings'
            );
        }
        this.rel = rel;
    }

    get rel() {
        return this.#rel;
    }

    set rel(value) {
        this.#rel = coerce.toStringArray(value, this.rel);
    }

    static isValid(value) {
        return (
            value instanceof EmbeddedRepresentation ||
            (isNonNullObject(value) && isArray(value.rel))
        );
    }

    static of(value) {
        if (value instanceof EmbeddedRepresentation) {
            return value;
        }
        const { rel, ...rest } = value;
        return new EmbeddedRepresentation(rel, rest);
    }
}

export class SubEntity {
    static isValid(value) {
        return (
            EmbeddedLink.isValid(value) || EmbeddedRepresentation.isValid(value)
        );
    }

    static of(value) {
        if (EmbeddedLink.isValid(value)) {
            return EmbeddedLink.of(value);
        } else {
            return EmbeddedRepresentation.of(value);
        }
    }
}
