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
 * Creates a `ParsedField` object
 * @param name Name of the field
 * @param options Object containing optional field members (e.g., `title`, `type`) and extensions
 */
export function field<T>(name: string, options: OptionalFieldMembers<T> = {}): ParsedField<T> {
    const { 'class': fieldClass, title, type, value, ...extensions } = options;
    return deepFreeze({
        name: coerce.toString(name),
        class: coerce.toOptionalStringArray(fieldClass),
        title: coerce.toOptionalString(title),
        type: coerce.toOptionalString(type),
        value,
        ...extensions,

        update<U>(value: U): ParsedField<U> {
            return field(name, { ...options, value });
        }
    });
}

export type OptionalFieldMembers<T> = Extendable & Pick<ParsableField<T>, 'class' | 'title' | 'type' | 'value'>;

export interface ParsableField<T = unknown> extends Extendable {
    class?: string[] | string;
    name: string;
    title?: string;
    type?: string;
    value?: T;
}

export interface ParsedField<T = unknown> extends Field<T> {
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
 * Determines whether `value` is a valid Siren field. Note that this is a strict
 * check. To see if `value` is parsable by `field()`, use `isParsableField()`.
 */
export function isField(value: unknown): value is Field {
    return isParsableField(value) &&
        (isUndefined(value.class) || isStringArray(value.class)) &&
        (isUndefined(value.title) || isString(value.title)) &&
        (isUndefined(value.type) || isString(value.type));
}

/**
 * Determines whether `value` is a parsable Siren field. This function differs
 * from `isField()` in that the loose parsing rules of `field()` are taken into
 * consideration.
 */
export function isParsableField(value: unknown): value is ParsableField {
    return isRecord(value) && isString(value.name);
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
