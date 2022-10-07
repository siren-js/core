import '../../test/setup';

import { entity, siren } from '../../test/stubs';
import { stringify } from './stringify';

describe('stringify', () => {
  it('should stringify Entity as JSON text', () => {
    const result = stringify(entity);

    expect(result).toBe(siren);
  });
});
