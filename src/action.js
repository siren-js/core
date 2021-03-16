import { Field } from './field';
import * as coerce from './util/coerce';
import {
    isArray,
    isNonNullObject,
    isNullish,
    isString,
    isUri
} from './util/type-guard';

export * from './field';

export class Action {
    #name;
    #href;
    #class;
    #fields;
    #method;
    #title;
    #type;

    constructor(name, href, options = {}) {
        if (!isString(name)) {
            throw new TypeError('Action.name must be a string');
        }
        if (!isUri(href)) {
            throw new TypeError('Action.href must be a URI');
        }

        const {
            class: actionClass,
            fields,
            method,
            title,
            type,
            ...extensions
        } = options ?? {};

        this.#name = name;
        this.href = href;
        this.class = actionClass;
        this.fields = fields;
        this.method = method;
        this.title = title;
        this.type = type;

        Object.keys(extensions).forEach((key) => {
            this[key] = extensions[key];
        });
    }

    get name() {
        return this.#name;
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

    get fields() {
        return this.#fields;
    }

    set fields(value) {
        if (isArray(value)) {
            const [fields] = value
                .filter(Field.isValid)
                .map(Field.of)
                .reduce(
                    ([fields, names], field) => {
                        if (!names.has(field.name)) {
                            fields.push(field);
                            names.add(field.name);
                        }
                        return [fields, names];
                    },
                    [[], new Set()]
                );
            this.#fields = Object.freeze(fields);
        } else if (isNullish(value)) {
            this.#fields = undefined;
        }
    }

    get method() {
        return this.#method;
    }

    set method(value) {
        this.#method = coerce.toOptionalString(value, this.method);
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
            name,
            href,
            class: actionClass,
            fields,
            method,
            title,
            type,
            ...extensions
        } = this;
        return {
            name,
            href,
            class: actionClass,
            fields,
            method,
            title,
            type,
            ...extensions
        };
    }

    static isValid(value) {
        return (
            value instanceof Action ||
            (isNonNullObject(value) &&
                isString(value.name) &&
                isUri(value.href))
        );
    }

    static of(value) {
        if (value instanceof Action) {
            return value;
        }
        const { name, href, ...rest } = value;
        return new Action(name, href, rest);
    }
}
