/**
 * Copyright (C) 2020  Dillon Redding
 *
 * See the full notice in the LICENSE file at the top level of the repository.
 */

/**
 * Common HTTP methods for APIs
 */
export enum HttpMethod {
    Delete = 'DELETE',
    Get = 'GET',
    Head = 'HEAD',
    Options = 'OPTIONS',
    Patch = 'PATCH',
    Post = 'POST',
    Put = 'PUT',
    Trace = 'TRACE'
}

/**
 * Common media types used for Siren APIs
 *
 * For more comprehensive media type usage, check out the
 * [`mime-types`](https://www.npmjs.com/package/mime-types) package on NPM.
 */
export const MediaType = Object.freeze({
    Application: Object.freeze({
        Siren: 'application/vnd.siren+json',
        UrlEncodedForm: 'application/x-www-form-urlencoded'
    }),
    Multipart: Object.freeze({
        FormData: 'multipart/form-data'
    }),
    Text: Object.freeze({
        Plain: 'text/plain'
    })
});
