import * as coerce from './util/coerce';
import extendWith from './util/extend-with';
import { isArray, isNonNullObject, isString, isUri } from './util/type-guard';

export class Link {
    #rel;
    #href;
    #class;
    #title;
    #type;

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

    get rel() {
        return this.#rel;
    }

    set rel(value) {
        this.#rel = coerce.toStringArray(value, this.rel);
    }

    get href() {
        return this.#href;
    }

    set href(value) {
        this.#href = coerce.toUriReference(value, this.href);
    }

    get class() {
        return this.#class;
    }

    set class(value) {
        this.#class = coerce.toOptionalStringArray(value, this.class);
    }

    get title() {
        return this.#title;
    }

    set title(value) {
        this.#title = coerce.toOptionalString(value, this.title);
    }

    get type() {
        return this.#type;
    }

    set type(value) {
        this.#type = coerce.toOptionalMediaTypeString(value, this.type);
    }

    toJSON() {
        const {
            rel,
            href,
            class: linkClass,
            title,
            type,
            ...extensions
        } = this;
        return { rel, href, class: linkClass, title, type, ...extensions };
    }

    static isValid(value) {
        return (
            value instanceof Link ||
            (isNonNullObject(value) &&
                (isArray(value.rel) || isString(value.rel)) &&
                isUri(value.href))
        );
    }

    static of(value) {
        if (value instanceof Link) {
            return value;
        }
        const { rel, href, ...rest } = value;
        return new Link(rel, href, rest);
    }
}
