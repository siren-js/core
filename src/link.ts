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
 * Creates an immutable `Link` object. Note that values are loosely coerced. For
 * example, a string passed in for `rel`, will be converted to a singleton
 * string array. Regardless of what is passed, a valid Siren link will always be
 * produced.
 * @param rel List of link relation types
 * @param href URI of the linked resource
 * @param optional Object containing optional link members (e.g., `title`, `type`) and extensions
 * @throws {TypeError} if `href` is an invalid URI
 */
export function link(rel: readonly string[] | string, href: string | URL, optional: OptionalLinkMembers = {}): Link {
    const { 'class': linkClass, title, type, ...extensions } = optional;
    return deepFreeze({
        rel: coerce.toStringArray(rel),
        href: coerce.toUriString(href),
        class: coerce.toOptionalStringArray(linkClass),
        title: coerce.toOptionalString(title),
        type: toMediaTypeString(type),
        ...extensions
    });
}

export type OptionalLinkMembers = Extendable & {
    class?: string[] | string;
    title?: string;
    type?: string;
};

/**
 * Describes a Siren [link](https://github.com/kevinswiber/siren#links-1), which
 * represents a navigational transition.
 */
export interface Link extends Extendable {
    /**
     * Describes aspects of the link based on the current representation.
     */
    readonly class?: readonly string[];

    /**
     * The URI of the linked resource.
     */
    readonly href: string;

    /**
     * Defines the relationship of the link to its entity, per
     * [RFC 8288](http://tools.ietf.org/html/rfc8288).
     */
    readonly rel: readonly string[];

    /**
     * Text describing the nature of a link.
     */
    readonly title?: string;

    /**
     * Defines the media type of the linked resource, per
     * [RFC 8288](http://tools.ietf.org/html/rfc8288).
     */
    readonly type?: string;
}

function toMediaTypeString(value: unknown): string | undefined {
    if (!isMediaTypeString(value)) {
        return undefined;
    } else {
        return value;
    }
}

function isMediaTypeString(value: unknown): value is string {
    return isString(value) && mediaTypeRegExp.test(value);
}

const mediaTypeRegExp = /[A-Za-z0-9][\w!#$&\-^.+]{0,126}\/[A-Za-z0-9][\w!#$&\-^.+]{0,126}/;
//                       \___rnf___/\_______rnc________/  \___rnf___/\_______rnc________/
//                        \______restricted-name______/    \______restricted-name______/
//                         \________type-name________/      \______subtype-name_______/

/**
 * Determines whether `value` is a valid Siren link.
 */
export function isLink(value: unknown): value is Link {
    return isRecord(value) &&
        isStringArray(value.rel) &&
        isUri(value.href) &&
        (isUndefined(value.class) || isStringArray(value.class)) &&
        (isUndefined(value.title) || isString(value.title)) &&
        (isUndefined(value.type) || isMediaTypeString(value.type));
}

function isUri(value: unknown): value is string {
    if (!isString(value)) {
        return false;
    }
    try {
        new URL(value, 'http://example.com');
        return true;
    } catch {
        return false;
    }
}
