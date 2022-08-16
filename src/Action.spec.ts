import '../test/setup';

import { Action, ActionLike } from './Action';
import { ValidationError } from './utils';

describe('Action', () => {
  const name = 'add-item';
  const href = 'http://example.com';

  it('should require name', () => {
    const action: ActionLike = {
      name,
      href,
      class: ['create', 'append'],
      title: 'Add Item',
      type: 'multipart/form-data',
      method: 'POST',
      fields: [{ name: 'quantity' }, { name: 'productCode' }]
    };

    const result = Action.of(action);

    expect(result).toMatchObject(action);
  });

  it('should validate known properties', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const value: ActionLike = {
      name: <any>1,
      href: <any>2,
      class: <any>3,
      title: <any>4,
      type: <any>5,
      method: <any>6,
      fields: [{ name: <any>7 }]
    };
    /* eslint-enable @typescript-eslint/no-explicit-any */

    try {
      Action.of(value);
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).errors).toHaveLength(Object.keys(value).length);
    }
  });

  it('should require unique field names', () => {
    expect(() => Action.of({ name, href, fields: [{ name: 'foo' }, { name: 'foo' }] })).toThrow();
  });

  it('should allow unknown properties', () => {
    const action: ActionLike = { name, href, encoding: 'UTF-16' };

    const result = Action.of(action);

    expect(result).toHaveProperty('encoding', action.encoding);
  });

  it('should default method and type to GET and application/x-www-form-urlencoded', () => {
    const result = Action.of({ name, href });

    expect(result.method).toBe('GET');
    expect(result.type).toBe('application/x-www-form-urlencoded');
  });

  describe('findFieldByName', () => {
    const action = Action.of({
      name,
      href,
      fields: [{ name: 'quantity' }]
    });

    it('should return field with matching name', () => {
      const result = action.findFieldByName('quantity');

      expect(result).toEqual(action.fields?.[0]);
    });

    it('should return undefined when no field name matches', () => {
      const result = action.findFieldByName('missing');

      expect(result).toBeUndefined();
    });

    it('should return undefined when action has no fields', () => {
      const action = Action.of({ name, href });

      const result = action.findFieldByName('quantity');

      expect(result).toBeUndefined();
    });
  });

  describe('findFieldsByClass', () => {
    const action = Action.of({
      name,
      href,
      fields: [
        { name: 'a', class: ['integer', 'positive'] },
        { name: 'b', class: ['integer'] },
        { name: 'c', class: ['double'] },
        { name: 'd' }
      ]
    });

    it('should return all matching fields', () => {
      const result = action.findFieldsByClass('integer');

      expect(result).toEqual(action.fields?.slice(0, 2));
    });

    it('should only return fields with all given classes', () => {
      const result = action.findFieldsByClass('integer', 'positive');

      expect(result).toEqual([action.fields?.[0]]);
    });

    it('should return empty array when no fields match', () => {
      const result = action.findFieldsByClass('missing');

      expect(result).toHaveLength(0);
    });

    it('should return empty array when action has no fields', () => {
      const action = Action.of({ name, href });

      const result = action.findFieldsByClass('missing');

      expect(result).toHaveLength(0);
    });
  });
});
