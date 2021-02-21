/**
 * Copyright (C) 2020  Dillon Redding
 *
 * See the full notice in the LICENSE file at the top level of the repository.
 */
import { isLink, link, Link, OptionalLinkMembers } from './link';

/**
 * Creates an `EmbeddedLink` object
 * @param rel List of link relation types
 * @param href URI of the sub-entity
 * @param options Object containing optional link members (e.g., `title`, `type`) and extensions
 * @throws {TypeError} if `href` is an invalid URI
 */
export function embeddedLink(rel: readonly string[] | string, href: string | URL, options: OptionalEmbeddedLinkMembers = {}): EmbeddedLink {
    return link(rel, href, options);
}

export type OptionalEmbeddedLinkMembers = OptionalLinkMembers;

export type EmbeddedLink = Link;

/**
 * Determines whether `value` is an `EmbeddedLink`
 */
export function isEmbeddedLink(value: unknown): value is EmbeddedLink {
    return isLink(value);
}
