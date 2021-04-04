import { EmbeddedLink } from '../embedded-link';
import { Link } from '../link';

const rel = ['self'];
const href = 'http://example.com';

describe('EmbeddedLink', () => {
  it('should be instanceof Link', () => {
    const link = new EmbeddedLink(rel, href);

    expect(link).toBeInstanceOf(EmbeddedLink);
    expect(link).toBeInstanceOf(Link);
  });
});

describe('EmbeddedLink.rel', () => {
  it('should accept any array of strings', () => {
    [rel, ['collection', 'up']].forEach((value) => {
      const link = new EmbeddedLink(value, href);
      expect(link.rel).toEqual(value);
    });
  });

  it('should coerce string to singleton array', () => {
    ['self', ''].forEach((value) => {
      const link = new EmbeddedLink(value, href);
      expect(link.rel).toEqual([value]);
    });

    const link = new EmbeddedLink(rel, href);

    link.rel = 'up';

    expect(link.rel).toEqual(['up']);
  });

  it('should remove non-strings from array', () => {
    const rels = [true, 42, 'self', null, undefined];
    const link1 = new EmbeddedLink(['collection'], href);

    const link2 = new EmbeddedLink(rels, href);
    link1.rel = rels;

    expect(link1.rel).toEqual(rel);
    expect(link2.rel).toEqual(rel);
  });

  it('should require non-empty rel', () => {
    expect(() => new EmbeddedLink([], href)).toThrow(
      'EmbeddedLink.rel must be non-empty'
    );
    expect(() => new EmbeddedLink([42], href)).toThrow(
      'EmbeddedLink.rel must be non-empty'
    );
  });

  it('should ignore empty rel', () => {
    const link = new EmbeddedLink(rel, href);

    [[], [42]].forEach((value) => {
      link.rel = value;
      expect(link.rel).toEqual(rel);
    });
  });

  it('should throw TypeError when constructor arg is invalid', () => {
    [undefined, null, true, 42, {}].forEach((value) => {
      expect(() => new EmbeddedLink(value, href)).toThrow(TypeError);
    });
  });

  it('should ignore invalid value in setter', () => {
    const link = new EmbeddedLink(rel, href);

    [undefined, null, true, 42, {}].forEach((value) => {
      link.rel = value;
      expect(link.rel).toEqual(rel);
    });
  });
});

describe('EmbeddedLink.isValid', () => {
  it('should return true if object is parsable', () => {
    const links = [
      { rel, href },
      { rel: 'self', href }
    ];

    links.forEach((value) => expect(EmbeddedLink.isValid(value)).toBe(true));
  });

  it('should return false if object is not parsable', () => {
    const invalidHref = 'http://\uFFFF.com';
    const links = [
      {},
      { rel },
      { href },
      { rel: 42, href },
      { rel: [], href },
      { rel, href: invalidHref },
      { rel: 'self', href: invalidHref }
    ];

    links.forEach((value) => expect(EmbeddedLink.isValid(value)).toBe(false));
  });
});

test('EmbeddedLink serialization', () => {
  const link = new EmbeddedLink(rel, href, {
    class: ['home'],
    title: 'Home Page',
    type: 'text/html',
    hreflang: 'en-US'
  });

  const json = JSON.stringify(link, null, 2);

  expect(json).toMatchSnapshot();
});
