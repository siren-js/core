/**
 * Copyright (C) 2020  Dillon Redding
 *
 * See the full notice in the LICENSE file at the top level of the repository.
 */

/**
 * Common interface for allowing extensions
 */
export default interface Extendable {
    /**
     * Extension properties not defined in the core Siren specification
     */
    [extension: string]: unknown;
}
