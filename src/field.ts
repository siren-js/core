/**
 * Copyright (C) 2020  Dillon Redding
 *
 * See the full notice in the LICENSE file at the top level of the repository.
 */
import * as coerce from './util/coerce';
import Extendable from './util/extendable';
import { isRecord, isString, isStringArray, isUndefined } from './util/type-guards';

/**
 * Creates a `Field` object
 * @param name Name of the field
 * @param options Object containing optional field members (e.g., `title`, `type`) and extensions
 */
export function field<T>(name: string, options: Partial<Field<T>> = {}): Field<T> {
    const { 'class': fieldClass, title, type, value, ...extensions } = options;
    let _name = coerce.toString(name);
    let _class = coerce.toOptionalStringArray(fieldClass);
    let _title = coerce.toOptionalString(title);
    let _type = coerce.toOptionalString(type);
    return {
        get name() { return _name; },
        set name(value) {
            _name = coerce.toString(value);
        },

        get class() { return _class; },
        set class(value) {
            _class = coerce.toOptionalStringArray(value);
        },

        get title() { return _title; },
        set title(value) {
            _title = coerce.toOptionalString(value);
        },

        get type() { return _type; },
        set type(value) {
            _type = coerce.toOptionalString(value);
        },

        value,

        ...extensions
    };
}

/**
 * Describes a Siren [field](https://github.com/kevinswiber/siren#fields-1),
 * which represents a control inside of an `Action`.
 */
export interface Field<T = unknown> extends Extendable {
    /**
     * Describes aspects of the field based on the current representation.
     */
    class?: readonly string[];

    /**
     * A name describing the control.
     */
    name: string;

    /**
     * Textual annotation of a field. Clients may use this as a label.
     */
    title?: string;

    /**
     * The input type of the field. This may include
     * [input types](https://html.spec.whatwg.org/#the-input-element) specified
     * in HTML5 (see the `FieldType` enumeration). The default value is
     * `'text'`.
     */
    type?: string;

    /**
     * A value assigned to the field.
     */
    value?: T;
}

/**
 * Determines whether `value` is a valid Siren field. Note that this is a strict
 * check. To see if `value` is parsable by `field()`, use `isParsableField()`.
 */
export function isField(value: unknown): value is Field {
    return isParsableField(value) &&
        isString(value.name) &&
        (isUndefined(value.class) || isStringArray(value.class)) &&
        (isUndefined(value.title) || isString(value.title)) &&
        (isUndefined(value.type) || isString(value.type));
}

/**
 * Determines whether `value` is a `ParsableField`, meaning it can be
 * destructured and passed to `field()` This function differs
 * from `isField()` in that the loose parsing rules of `field()` are taken into
 * consideration.
 */
export function isParsableField(value: unknown): value is ParsableField {
    return isRecord(value) && !isUndefined(value.name);
}

export interface ParsableField extends Extendable {
    name: unknown;
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
