import '../test/setup';

import { Field } from './Field';
import { ValidationError } from './utils';

describe('Field', () => {
  const name = 'quantity';

  it('should require name', () => {
    const field: Field = {
      name,
      class: ['int'],
      title: 'Quantity',
      type: 'number',
      value: 69
    };

    const result = Field.of(field);

    expect(result).toEqual(field);
  });

  it('should validate known properties', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value: Field = { name: <any>1, class: <any>2, title: <any>3, type: <any>4 };

    try {
      Field.of(value);
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).errors).toHaveLength(Object.keys(value).length);
    }
  });

  it('should allow unknown properties', () => {
    const field: Field = {
      name,
      min: 1,
      step: '2'
    };

    const result = Field.of(field);

    expect(result).toHaveProperty('min', field.min);
    expect(result).toHaveProperty('step', field.step);
  });

  it('should default type to text', () => {
    const result = Field.of({ name });

    expect(result.type).toBe('text');
  });
});
