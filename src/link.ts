/**
 * Copyright (C) 2020  Dillon Redding
 *
 * See the full notice in the LICENSE file at the top level of the repository.
 */
import * as coerce from './util/coerce';
import deepFreeze from './util/deep-freeze';
import Extendable from './util/extendable';
import { isMediaTypeString, isRecord, isString, isStringArray, isUndefined, isUri } from './util/type-guards';

/**
 * Creates a `Link` object
 * @param rel List of link relation types
 * @param href URI of the linked resource
 * @param options Object containing optional link members (e.g., `title`, `type`) and extensions
 * @throws {TypeError} if `href` is an invalid URI
 */
export function link(rel: readonly string[] | string, href: string | URL, options: OptionalLinkMembers = {}): Link {
    const { 'class': linkClass, title, type, ...extensions } = options;
    return deepFreeze({
        rel: coerce.toStringArray(rel),
        href: coerce.toUriString(href),
        class: coerce.toOptionalStringArray(linkClass),
        title: coerce.toOptionalString(title),
        type: coerce.toMediaTypeString(type),
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
