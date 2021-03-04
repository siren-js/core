/**
 * Copyright (C) 2020  Dillon Redding
 *
 * See the full notice in the LICENSE file at the top level of the repository.
 */
import { field, Field, isField, isParsableField } from './field';
import * as coerce from './util/coerce';
import Extendable from './util/extendable';
import { isArray, isMediaTypeString, isRecord, isString, isStringArray, isTypedArray, isUndefined, isUri } from './util/type-guards';

export * from './field';

/**
 * Creates a `ParsedAction` object
 * @param name Name of the action; should be unique within an entity
 * @param href Action's request target
 * @param options Object containing optional action members (e.g., `title`, `type`) and extensions
 */
export function action(name: string, href: string | URL, options: Partial<Action> = {}): ParsedAction {
    const { 'class': actionClass, fields, method, title, type, ...extensions } = options;
    let _name = coerce.toString(name);
    let _href = coerce.toUriString(href);
    let _class = coerce.toOptionalStringArray(actionClass);
    let _method = coerce.toOptionalString(method);
    let _title = coerce.toOptionalString(title);
    let _type = coerce.toMediaTypeString(type);
    let _fields = coerceFields(fields);
    return {
        get name() { return _name; },
        set name(value) {
            _name = coerce.toString(value);
        },

        get href() { return _href; },
        set href(value) {
            _href = coerce.toUriString(value);
        },

        get class() { return _class; },
        set class(value) {
            _class = coerce.toOptionalStringArray(value);
        },

        get method() { return _method; },
        set method(value) {
            _method = coerce.toOptionalString(value);
        },

        get title() { return _title; },
        set title(value) {
            _title = coerce.toOptionalString(value);
        },

        get type() { return _type; },
        set type(value) {
            _type = coerce.toMediaTypeString(value);
        },

        get fields() { return _fields; },
        set fields(value) {
            _fields = coerceFields(value);
        },

        ...extensions,

        field(name: string): Field | undefined {
            return this.fields?.find(field => field.name === name);
        }
    };
}

export interface ParsedAction extends Action {
    /**
     * @param name Name of the field to look up (case-sensitive)
     * @returns The field with the given `name`, or `undefined` if it does not exist.
     */
    field(name: string): Field | undefined;
}

export interface Action extends Extendable {
    /**
     * Describes the nature of an action based on the current representation.
     */
    class?: readonly string[];

    /**
     * A collection of input controls.
     */
    fields?: readonly Field[];

    /**
     * The URI of the action.
     */
    href: string;

    /**
     * An enumerated attribute mapping to a protocol method. When omitted, the
     * default value is assumed to be `'GET'`.
     */
    method?: string;

    /**
     * A string that identifies the action to be performed.
     */
    name: string;

    /**
     * Descriptive text about the action.
     */
    title?: string;

    /**
     * The encoding type for the request. When omitted and the `fields`
     * attribute is present, the default value is assumed to be
     * `'application/x-www-form-urlencoded'`.
     */
    type?: string;
}

function coerceFields(value: unknown): readonly Field[] | undefined {
    if (!isArray(value)) {
        return undefined;
    }

    const indexedFields = value.reduce((map: Map<string, Field>, v) => {
        if (isParsableField(v)) {
            const { name, ...rest } = v;
            const fieldName = coerce.toString(name);
            if (!map.has(fieldName)) {
                map.set(fieldName, field(fieldName, rest));
            }
        }
        return map;
    }, new Map<string, Field>());

    return Object.freeze(Array.from(indexedFields.values()));
}

export function isAction(value: unknown): value is Action {
    return isParsableAction(value) &&
        isString(value.name) &&
        isString(value.href) &&
        (isUndefined(value.class) || isStringArray(value.class)) &&
        (isUndefined(value.fields) || (isTypedArray(value.fields, isField) && hasUniqueNames(value.fields))) &&
        (isUndefined(value.method) || isString(value.method)) &&
        (isUndefined(value.title) || isString(value.title)) &&
        (isUndefined(value.type) || isMediaTypeString(value.type));
}

export function isParsableAction(value: unknown): value is ParsableAction {
    return isRecord(value) && !isUndefined(value.name) && isUri(value.href);
}

export interface ParsableAction extends Extendable {
    href: string | URL;
    name: unknown;
}

function hasUniqueNames(fields: Field[]): boolean {
    const names = fields.reduce((names, { name }) => names.add(name), new Set<string>());
    return names.size === fields.length;
}
