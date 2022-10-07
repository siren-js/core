import { Matches, ValidationOptions } from 'class-validator';

/** `RegExp` for a URI as defined in [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986#appendix-B) */
const uriRegExp = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;

export const IsUri = (options?: ValidationOptions) => Matches(uriRegExp, options);
