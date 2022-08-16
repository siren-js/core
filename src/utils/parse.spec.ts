import '../../test/setup';

import { entity, siren } from '../../test/stubs';
import { parse } from './parse';

describe('parse', () => {
  it('should parse JSON text as Siren Entity', () => {
    const result = parse(siren);

    expect(result).toStrictEqual(entity);
  });

  it('should throw error when parsing invalid Siren', () => {
    expect(() => parse('{ "class": [1, 2, 3] }')).toThrow();
  });
});
