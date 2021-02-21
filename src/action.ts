/**
 * Copyright (C) 2020  Dillon Redding
 *
 * See the full notice in the LICENSE file at the top level of the repository.
 */
import * as coerce from './coerce';
import deepFreeze from './deep-freeze';
import Extendable from './extendable';
import { field, Field, isField, isParsableField, ParsedField } from './field';
import { isArray, isMediaTypeString, isRecord, isString, isStringArray, isTypedArray, isUndefined, isUri } from './type-guards';

export * from './field';

export function action(name: string, href: string | URL, options: OptionalActionMembers = {}): ParsedAction {
    const { 'class': actionClass, fields, method, title, type, ...extensions } = options;
    const [indexedFields, parsedFields] = coerceFields(fields);
    return deepFreeze({
        name: coerce.toString(name),
        href: coerce.toUriString(href),
        class: coerce.toOptionalStringArray(actionClass),
        method: coerce.toOptionalString(method),
        title: coerce.toOptionalString(title),
        type: coerce.toMediaTypeString(type),
        fields: parsedFields,
        ...extensions,

        findFieldByName(name: string): ParsedField | undefined {
            return indexedFields.get(name);
        },

        updateField<T>(name: string, value: T): ParsedAction {
            if (!indexedFields.has(name)) {
                return this;
            } else {
                return action(this.name, href, {
                    ...options,
                    fields: parsedFields?.map(field => (field.name === name) ? field.update(value) : field)
                });
            }
        }
    });
}

export type OptionalActionMembers = Extendable & Pick<ParsableAction, 'class' | 'fields' | 'method' | 'title' | 'type'>;

export interface ParsableAction extends Extendable {
    class?: string[] | string;
    fields?: Field[];
    href: string | URL;
    method?: string;
    name: string;
    title?: string;
    type?: string;
}

export interface ParsedAction extends Action {
    /**
     * Searches within the action for a field with the given `name`
     * (case-sensitive).
     * @param name Name of the field to search for
     * @returns The field with the given `name`, or `undefined` if it does not exist.
     */
    findFieldByName(name: string): Field | undefined;

    /**
     * Updates the value of the field with the given `name` to `value`.
     * @param name
     * @param value
     * @returns A new action with the updated field.
     */
    updateField<T>(name: string, value: T): ParsedAction;
}

export interface Action extends Extendable {
    /**
     * Describes the nature of an action based on the current representation.
     */
    readonly class?: readonly string[];

    /**
     * A collection of input controls.
     */
    readonly fields?: readonly Field[];

    /**
     * The URI of the action.
     */
    readonly href: string;

    /**
     * An enumerated attribute mapping to a protocol method. When omitted, the
     * default value is assumed to be `'GET'`.
     */
    readonly method?: string;

    /**
     * A string that identifies the action to be performed.
     */
    readonly name: string;

    /**
     * Descriptive text about the action.
     */
    readonly title?: string;

    /**
     * The encoding type for the request. When omitted and the `fields`
     * attribute is present, the default value is assumed to be
     * `'application/x-www-form-urlencoded'`.
     */
    readonly type?: string;
}

function coerceFields(value: unknown): [Map<string, ParsedField>, ParsedField[] | undefined] {
    const indexedFields = new Map<string, ParsedField>();
    if (isArray(value)) {
        value.forEach(v => {
            if (isParsableField(v)) {
                const { name, ...rest } = v;
                if (!indexedFields.has(name)) {
                    indexedFields.set(name, field(name, rest));
                }
            }
        });
        return [indexedFields, [...indexedFields.values()]];
    } else {
        return [indexedFields, undefined];
    }
}

export function isAction(value: unknown): value is Action {
    return isParsableAction(value) &&
        (isUndefined(value.class) || isStringArray(value.class)) &&
        (isUndefined(value.fields) || (isTypedArray(value.fields, isField) && hasUniqueNames(value.fields))) &&
        (isUndefined(value.method) || isString(value.method)) &&
        (isUndefined(value.title) || isString(value.title)) &&
        (isUndefined(value.type) || isMediaTypeString(value.type));
}

export function isParsableAction(value: unknown): value is ParsableAction {
    return isRecord(value) && isString(value.name) && isUri(value.href);
}

function hasUniqueNames(fields: Field[]): boolean {
    const names = fields.reduce((names, { name }) => names.add(name), new Set<string>());
    return names.size === fields.length;
}
