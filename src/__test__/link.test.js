import { Link } from '../link';

const rel = ['self'];
const href = 'http://example.com';

describe('Link constructor', () => {
  it('should throw TypeError when given no arguments', () => {
    expect(() => new Link()).toThrow(TypeError);
  });

  it('should handle null options gracefully', () => {
    expect(() => new Link(rel, href, null)).not.toThrow();
  });
});

describe('Link.rel', () => {
  it('should accept any array of strings', () => {
    [rel, ['collection', 'up'], []].forEach((value) => {
      const link = new Link(value, href);
      expect(link.rel).toEqual(value);
    });
  });

  it('should coerce string to singleton array', () => {
    ['self', ''].forEach((value) => {
      const link = new Link(value, href);
      expect(link.rel).toEqual([value]);
    });

    const link = new Link(rel, href);

    link.rel = 'up';

    expect(link.rel).toEqual(['up']);
  });

  it('should remove non-strings from array', () => {
    const rels = [true, 42, 'self', null, undefined];
    const link1 = new Link(['collection'], href);

    const link2 = new Link(rels, href);
    link1.rel = rels;

    expect(link1.rel).toEqual(rel);
    expect(link2.rel).toEqual(rel);
  });

  it('should throw TypeError when constructor arg is invalid', () => {
    [undefined, null, true, 42, {}].forEach((value) => {
      expect(() => new Link(value, href)).toThrow(TypeError);
    });
  });

  it('should ignore invalid value in setter', () => {
    const link = new Link(rel, href);

    [undefined, null, true, 42, {}].forEach((value) => {
      link.rel = value;
      expect(link.rel).toEqual(rel);
    });
  });
});

describe('Link.href', () => {
  it('should accept any URI string', () => {
    [href, '/orders'].forEach((value) => {
      const link = new Link(rel, value);
      expect(link.href).toEqual(value);
    });
  });

  it('should coerce URL to string', () => {
    const url = new URL(href);

    const link = new Link(rel, url);

    expect(link.href).not.toBeInstanceOf(URL);
    expect(link.href.startsWith(href)).toBe(true);
  });

  const invalidHrefs = [undefined, null, true, 42, 'http://\uFFFF.com'];

  it('should throw TypeError when constructor arg is invalid URI', () => {
    invalidHrefs.forEach((value) => {
      expect(() => new Link(rel, value)).toThrow(TypeError);
    });
  });

  it('should ignore invalid URI in setter', () => {
    const link = new Link(rel, href);

    invalidHrefs.forEach((value) => {
      link.href = value;
      expect(link.href).toEqual(href);
    });
  });
});

describe('Link.class', () => {
  it('should accept any array of strings', () => {
    [['order'], ['customer', 'info'], []].forEach((value) => {
      let link = new Link(rel, href, { class: value });
      expect(link.class).toEqual(value);
    });
  });

  it('should coerce string to singleton array', () => {
    ['person', ''].forEach((value) => {
      const link = new Link(rel, href, { class: value });
      expect(link.class).toEqual([value]);
    });
  });

  it('should allow undefined and coerce null', () => {
    [undefined, null].forEach((value) => {
      const link = new Link(rel, href, { class: value });
      expect(link.class).toBeUndefined();
    });
  });

  it('should remove non-strings from array', () => {
    const link = new Link(rel, href, {
      class: [true, 42, 'person', null, undefined]
    });

    expect(link.class).toEqual(['person']);
  });

  it('should ignore invalid value', () => {
    [true, 42, {}].forEach((value) => {
      const link = new Link(rel, href, { class: value });
      expect(link.class).toBeUndefined();
    });
  });
});

describe('Link.title', () => {
  const title = 'This is a Link';

  it('should accept any string', () => {
    [title, 'Å Fâñçÿ Títlè', ''].forEach((value) => {
      let link = new Link(rel, href, { title: value });
      expect(link.title).toEqual(value);

      link = new Link(rel, href);
      link.title = value;
      expect(link.title).toEqual(value);
    });
  });

  it('should ignore non-string value', () => {
    [true, 42, [], {}].forEach((value) => {
      let link = new Link(rel, href, { title: value });
      expect(link.title).toBeUndefined();

      link = new Link(rel, href, { title });
      link.title = value;
      expect(link.title).toEqual(title);
    });
  });

  it('should allow undefined and coerce null to undefined', () => {
    [undefined, null].forEach((value) => {
      let link = new Link(rel, href, { title: value });
      expect(link.title).toBeUndefined();

      link = new Link(rel, href, { title });
      link.title = value;
      expect(link.title).toBeUndefined();
    });
  });
});

describe('Link.type', () => {
  const type = 'application/vnd.siren+json';

  it('should accept any media type string', () => {
    [type, 'text/html', 'application/xhtml+xml'].forEach((value) => {
      let link = new Link(rel, href, { type: value });
      expect(link.type).toEqual(value);

      link = new Link(rel, href);
      link.type = value;
      expect(link.type).toEqual(value);
    });
  });

  it('should ignore invalid media type string', () => {
    [true, 42, 'foo', [], {}].forEach((value) => {
      let link = new Link(rel, href, { type: value });
      expect(link.type).toBeUndefined();

      link = new Link(rel, href, { type });
      link.type = value;
      expect(link.type).toEqual(type);
    });
  });

  it('should allow undefined and coerce null to undefined', () => {
    [undefined, null].forEach((value) => {
      let link = new Link(rel, href, { type: value });
      expect(link.type).toBeUndefined();

      link = new Link(rel, href, { type });
      link.type = value;
      expect(link.type).toBeUndefined();
    });
  });
});

test('Link extensions', () => {
  const hreflang = 'en-US';
  const media = 'screen and (color)';

  const link = new Link(rel, href, { hreflang });
  link.media = media;

  expect(link.hreflang).toEqual(hreflang);
  expect(link.media).toEqual(media);
});

test('Link serialization', () => {
  const link = new Link(rel, href, {
    class: ['home'],
    title: 'Home Page',
    type: 'text/html',
    hreflang: 'en-US'
  });

  const json = JSON.stringify(link, null, 2);

  expect(json).toMatchSnapshot();
});
