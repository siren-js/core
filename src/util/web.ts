/**
 * Copyright (C) 2020  Dillon Redding
 *
 * See the full notice in the LICENSE file at the top level of the repository.
 */
import deepFreeze from './deep-freeze';

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
 * [`mime-types`](https://www.npmjs.com/package/mime-types) library.
 */
export const MediaType = deepFreeze({
    Application: {
        Siren: 'application/vnd.siren+json',
        UrlEncodedForm: 'application/x-www-form-urlencoded'
    },
    Multipart: {
        FormData: 'multipart/form-data'
    },
    Text: {
        Plain: 'text/plain'
    }
});
