import '../test/setup';

import { Link } from './Link';
import { ValidationError } from './utils';

describe('Link', () => {
  const rel = ['self'];
  const href = 'http://example.com';

  it('should require href and rel', () => {
    const link: Link = {
      rel,
      href,
      class: ['home'],
      title: 'Home',
      type: 'text/html'
    };

    const result = Link.of(link);

    expect(result).toEqual(link);
  });

  it('should validate known properties', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value: Link = { rel: <any>1, href: <any>2, class: <any>3, title: <any>4, type: <any>5 };

    try {
      Link.of(value);
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).errors).toHaveLength(Object.keys(value).length);
    }
  });

  it('should allow unknown properties', () => {
    const link: Link = {
      rel,
      href,
      hreflang: 'en-US',
      media: 'screen and (color)'
    };

    const result = Link.of(link);

    expect(result).toHaveProperty('hreflang', link.hreflang);
    expect(result).toHaveProperty('media', link.media);
  });
});
