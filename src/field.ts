/**
 * Copyright (C) 2020  Dillon Redding
 *
 * See the full notice in the LICENSE file at the top level of the repository.
 */
import * as coerce from './coerce';
import deepFreeze from './deep-freeze';
import Extendable from './extendable';
import { isRecord, isString, isStringArray, isUndefined } from './type-guards';

/**
 * Creates an immutable `Field` object with an `update` method for changing the
 * `Field`'s value. Note that values are loosely coerced. For example, a string
 * in passed for `class`, will be converted to a singleton string array.
 * Regardless of what is passed, a valid Siren field will always be produced.
 * @param name
 * @param optional
 */
export function field<T>(name: string, optional: OptionalFieldMembers<T> = {}): ParsedField<T> {
    const { 'class': fieldClass, title, type, value, ...extensions } = optional;
    return deepFreeze({
        name: coerce.toString(name),
        class: coerce.toOptionalStringArray(fieldClass),
        title: coerce.toOptionalString(title),
        type: coerce.toOptionalString(type),
        value,
        ...extensions,
        update<U>(value: U): ParsedField<U> {
            return field(name, { ...optional, value });
        }
    });
}

export type OptionalFieldMembers<T> = Extendable & {
    class?: string[] | string;
    title?: string;
    type?: string;
    value?: T;
};

export interface ParsedField<T> extends Field<T> {
    /**
     * Update the field's value.
     * @returns A new `Field` object with the updated value
     */
    update<U>(value: U): ParsedField<U>;
}

/**
 * Describes a Siren [field](https://github.com/kevinswiber/siren#fields-1),
 * which represents a control inside of an `Action`.
 */
export interface Field<T = unknown> extends Extendable {
    /**
     * Describes aspects of the field based on the current representation.
     */
    readonly class?: readonly string[];

    /**
     * A name describing the control.
     */
    readonly name: string;

    /**
     * Textual annotation of a field. Clients may use this as a label.
     */
    readonly title?: string;

    /**
     * The input type of the field. This may include
     * [input types](https://html.spec.whatwg.org/#the-input-element) specified
     * in HTML5 (see the `FieldType` enumeration). The default value is
     * `'text'`.
     */
    readonly type?: string;

    /**
     * A value assigned to the field.
     */
    readonly value?: Readonly<T>;
}

/**
 * Determines whether `value` is a valid Siren field.
 */
export function isField(value: unknown): value is Field {
    return isRecord(value) &&
        isString(value.name) &&
        (isUndefined(value.class) || isStringArray(value.class)) &&
        (isUndefined(value.title) || isString(value.title)) &&
        (isUndefined(value.type) || isString(value.type));
}

/**
 * Defines [input types](https://html.spec.whatwg.org/#attr-input-type-keywords)
 * specified in HTML5. `enum` names correspond to the input state and the values
 * correspond to the input keyword.
 */
export enum FieldType {
    Hidden = 'hidden',
    Text = 'text',
    Search = 'search',
    Telephone = 'tel',
    Url = 'url',
    Email = 'email',
    Password = 'password',
    Date = 'date',
    Month = 'month',
    Week = 'week',
    Time = 'time',
    LocalDateAndTime = 'datetime-local',
    Number = 'number',
    Range = 'range',
    Color = 'color',
    Checkbox = 'checkbox',
    RadioButton = 'radio',
    FileUpload = 'file',
    SubmitButton = 'submit',
    ImageButton = 'image',
    ResetButton = 'reset',
    Button = 'button'
}
