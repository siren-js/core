import { IsMimeType, IsOptional, IsString, IsUrl } from 'class-validator';

import { transformAndValidate } from './utils';

export class Link {
  /**
   * List of strings describing the nature of the `Link` based on the current representation. Possible values are
   * implementation-dependent and should be documented.
   */
  @IsOptional()
  @IsString({ each: true })
  class?: string[];

  /**
   * URI of the linked resource.
   */
  @IsUrl()
  href!: string;

  /**
   * List of strings describing the relationship of the `Link` to its `Entity`, per [RFC 8288](https://tools.ietf.org/html/rfc8288).
   */
  @IsString({ each: true })
  rel!: string[];

  /**
   * Text describing the nature of the link.
   */
  @IsOptional()
  @IsString()
  title?: string;

  /**
   * Hint indicating what the media type of the result of dereferencing the `Link` should be, per [RFC 8288](https://tools.ietf.org/html/rfc8288#section-3.4.1).
   */
  @IsMimeType()
  @IsOptional()
  type?: string;

  [extension: string]: unknown;

  static of(link: Link): Link {
    return transformAndValidate(this, link);
  }
}
