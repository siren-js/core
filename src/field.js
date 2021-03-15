import * as coerce from './util/coerce';
import { isNullish, isString } from './util/type-guard';

export class Field {
    #name;
    #class;
    #title;
    #type;
    #value;

    constructor(name, options = {}) {
        if (!isString(name)) {
            throw new TypeError('Field.name must be a string');
        }

        const { class: fieldClass, title, type, value, ...extensions } =
            options ?? {};

        this.#name = name;
        this.class = fieldClass;
        this.title = title;
        this.type = type;
        this.value = value;

        Object.keys(extensions).forEach((key) => {
            this[key] = extensions[key];
        });
    }

    get name() {
        return this.#name;
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
        this.#type = coerce.toOptionalString(value, this.type);
    }

    get value() {
        return this.#value;
    }

    set value(value) {
        this.#value = isNullish(value) ? undefined : value;
    }
}
