/**
 * Copyright (C) 2020  Dillon Redding
 *
 * See the full notice in the LICENSE file at the top level of the repository.
 */
import * as coerce from './util/coerce';
import Extendable from './util/extendable';
import { isArray, isMediaTypeString, isRecord, isString, isStringArray, isUndefined, isUri } from './util/type-guards';

/**
 * Creates a `Link` object
 * @param rel List of link relation types
 * @param href URI of the linked resource
 * @param options Object containing optional link members (e.g., `title`, `type`) and extensions
 * @throws {TypeError} if `href` is an invalid URI
 */
export function link(rel: readonly string[] | string, href: string | URL, options: Partial<Link> = {}): Link {
    const { 'class': linkClass, title, type, ...extensions } = options;
    let _rel = coerce.toStringArray(rel);
    let _href = coerce.toUriString(href);
    let _class = coerce.toOptionalStringArray(linkClass);
    let _title = coerce.toOptionalString(title);
    let _type = coerce.toMediaTypeString(type);
    return {
        get rel() { return _rel; },
        set rel(value) {
            _rel = coerce.toStringArray(value);
        },

        get href() { return _href; },
        set href(value) {
            _href = coerce.toUriString(value);
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
            _type = coerce.toMediaTypeString(value);
        },

        ...extensions
    };
}

/**
 * Describes a Siren [link](https://github.com/kevinswiber/siren#links-1), which
 * represents a navigational transition.
 */
export interface Link extends Extendable {
    /**
     * Describes aspects of the link based on the current representation.
     */
    class?: readonly string[];

    /**
     * The URI of the linked resource.
     */
    href: string;

    /**
     * Defines the relationship of the link to its entity, per
     * [RFC 8288](http://tools.ietf.org/html/rfc8288).
     */
    rel: readonly string[];

    /**
     * Text describing the nature of a link.
     */
    title?: string;

    /**
     * Defines the media type of the linked resource, per
     * [RFC 8288](http://tools.ietf.org/html/rfc8288).
     */
    type?: string;
}

/**
 * Determines whether `value` is a valid `Link`.
 */
export function isLink(value: unknown): value is Link {
    return isParsableLink(value) &&
        isStringArray(value.rel) &&
        isString(value.href) &&
        (isUndefined(value.class) || isStringArray(value.class)) &&
        (isUndefined(value.title) || isString(value.title)) &&
        (isUndefined(value.type) || isMediaTypeString(value.type));
}

/**
 * Determines whether `value` is a `ParsableLink`, meaning it can be
 * destructured and passed to `link()`.
 */
export function isParsableLink(value: unknown): value is ParsableLink {
    return isRecord(value) && !isUndefined(value.rel) && isUri(value.href);
}

export interface ParsableLink extends Extendable {
    rel: unknown;
    href: string | URL;
}
