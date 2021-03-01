/**
 * Copyright (C) 2020  Dillon Redding
 *
 * See the full notice in the LICENSE file at the top level of the repository.
 */
import { isLink, isParsableLink, link, Link, ParsableLink } from './link';

/**
 * Creates an `EmbeddedLink` object
 * @param rel List of link relation types
 * @param href URI of the sub-entity
 * @param options Object containing optional link members (e.g., `title`, `type`) and extensions
 * @throws {TypeError} if `href` is an invalid URI
 */
export function embeddedLink(rel: readonly string[] | string, href: string | URL, options: Partial<EmbeddedLink> = {}): EmbeddedLink {
    return link(rel, href, options);
}

export type EmbeddedLink = Link;

/**
 * Determines whether `value` is an `EmbeddedLink`
 */
export function isEmbeddedLink(value: unknown): value is EmbeddedLink {
    return isLink(value);
}

/**
 * Determines whether `value` is a `ParsableEmbeddedLink`, meaning it can be
 * destructured and passed to `embeddedLink()`.
 */
export function isParsableEmbeddedLink(value: unknown): value is ParsableEmbeddedLink {
    return isParsableLink(value);
}

export type ParsableEmbeddedLink = ParsableLink;
