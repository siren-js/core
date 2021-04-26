/* eslint-disable @typescript-eslint/no-explicit-any */
import { Action, Field } from '../action';
import { construct } from './utils';

describe('Action', () => {
  const name = 'add-item';
  const href = 'http://example.com';

  describe('constructor', () => {
    it('should throw TypeError when given no arguments', () => {
      expect(() => construct(Action)).toThrow(TypeError);
    });

    it('should handle null options gracefully', () => {
      expect(() => construct(Action, name, href, null)).not.toThrow();
    });
  });

  describe('name', () => {
    it('should accept any string', () => {
      [name, 'edit item', ''].forEach((value) => {
        const action = new Action(value, href);
        expect(action.name).toEqual(value);
      });
    });

    it('should throw error given non-string in constructor', () => {
      [undefined, null, true, 42, [true, 42, 'foo'], { foo: 'bar' }].forEach(
        (value: any) => {
          expect(() => new Action(value, href)).toThrow(TypeError);
        }
      );
    });

    it('should be read-only', () => {
      const action = new Action(name, href);
      expect(() => ((<any>action.name) = 'foo')).toThrow(TypeError);
    });
  });

  describe('href', () => {
    it('should accept any URI string', () => {
      [href, '/orders'].forEach((value) => {
        const action = new Action(name, value);
        expect(action.href).toEqual(value);
      });
    });

    it('should coerce URL to string', () => {
      const url = new URL(href);

      const action = new Action(name, url);

      expect(action.href).not.toBeInstanceOf(URL);
      expect(action.href.startsWith(href)).toBe(true);
    });

    const invalidHrefs: any[] = [
      undefined,
      null,
      true,
      42,
      'http://\uFFFF.com'
    ];

    it('should throw TypeError when constructor arg is invalid URI', () => {
      invalidHrefs.forEach((value) => {
        expect(() => new Action(name, value)).toThrow(TypeError);
      });
    });

    it('should ignore invalid URI in setter', () => {
      const action = new Action(name, href);

      invalidHrefs.forEach((value) => {
        action.href = value;
        expect(action.href).toEqual(href);
      });
    });
  });

  describe('class', () => {
    it('should accept any array of strings', () => {
      [['integer'], ['positive', 'integer'], []].forEach((value) => {
        const action = new Action(name, href, { class: value });
        expect(action.class).toEqual(value);
      });
    });

    it('should coerce string to singleton array', () => {
      ['integer', ''].forEach((value) => {
        const action = new Action(name, href, { class: value });
        expect(action.class).toEqual([value]);
      });
    });

    it('should allow undefined and coerce null', () => {
      [undefined, null].forEach((value: any) => {
        const action = new Action(name, href, { class: value });
        expect(action.class).toBeUndefined();
      });
    });

    it('should remove non-strings from array', () => {
      const action = new Action(name, href, {
        class: <any[]>[true, 42, 'integer', null, undefined]
      });

      expect(action.class).toEqual(['integer']);
    });

    it('should ignore invalid value', () => {
      [true, 42, {}].forEach((value: any) => {
        const action = new Action(name, href, { class: value });
        expect(action.class).toBeUndefined();
      });
    });
  });

  describe('fields', () => {
    it('should accept empty array', () => {
      const action = new Action(name, href, { fields: [] });

      expect(action.fields).toEqual([]);
      expect(Object.isFrozen(action.fields)).toBe(true);
    });

    it('should accept array of fields', () => {
      const fields = [
        new Field('quantity', { title: 'Quantity', type: 'number' }),
        { name: 'units', title: 'Units' }
      ];

      const action = new Action(name, href, { fields });

      expect(action.fields).toHaveLength(fields.length);
      expect(action.fields?.[0]).toBe(fields[0]);
      expect(action.fields?.[1]).toBeInstanceOf(Field);
      expect(action.fields?.[1].name).toEqual(fields[1].name);
      expect(action.fields?.[1].title).toEqual(fields[1].title);
      expect(Object.isFrozen(action.fields)).toBe(true);
    });

    it('should remove duplicates', () => {
      const action = new Action(name, href, {
        fields: [
          { name: 'orderNumber' },
          { name: 'orderNumber', type: 'hidden' }
        ]
      });

      expect(action.fields).toHaveLength(1);
      expect(action.fields?.[0].type).toBeUndefined();
    });

    it('should allow undefined and coerce null', () => {
      [undefined, null].forEach((value: any) => {
        let entity = new Action(name, href, { fields: value });
        expect(entity.fields).toBeUndefined();

        entity = new Action(name, href, { fields: [] });
        entity.fields = value;
        expect(entity.fields).toBeUndefined();
      });
    });

    it('should filter invalid fields', () => {
      const action = new Action(name, href, {
        fields: <any[]>[{}, { title: 'Quantity' }]
      });

      expect(action.fields).toHaveLength(0);
    });

    it('should ignore non-array value', () => {
      const fields = [new Field('quantity')];
      [true, 42, {}].forEach((value: any) => {
        let action = new Action(name, href, { fields: value });
        expect(action.fields).toBeUndefined();

        action = new Action(name, href, { fields });
        action.fields = value;
        expect(action.fields).toEqual(fields);
      });
    });
  });

  describe('method', () => {
    const method = 'GET';

    it('should accept any string', () => {
      [method, 'GÉT', ''].forEach((value) => {
        let action = new Action(name, href, { method: value });
        expect(action.method).toEqual(value);

        action = new Action(name, href);
        action.method = value;
        expect(action.method).toEqual(value);
      });
    });

    it('should ignore non-string value', () => {
      [true, 42, [], {}].forEach((value: any) => {
        let action = new Action(name, href, { method: value });
        expect(action.method).toBeUndefined();

        action = new Action(name, href, { method: method });
        action.method = value;
        expect(action.method).toEqual(method);
      });
    });

    it('should allow undefined and coerce null to undefined', () => {
      [undefined, null].forEach((value: any) => {
        let action = new Action(name, href, { method: value });
        expect(action.method).toBeUndefined();

        action = new Action(name, href, { method: method });
        action.method = value;
        expect(action.method).toBeUndefined();
      });
    });
  });

  describe('title', () => {
    const title = 'This is an Action';

    it('should accept any string', () => {
      [title, 'Å Fâñçÿ Títlè', ''].forEach((value) => {
        let action = new Action(name, href, { title: value });
        expect(action.title).toEqual(value);

        action = new Action(name, href);
        action.title = value;
        expect(action.title).toEqual(value);
      });
    });

    it('should ignore non-string value', () => {
      [true, 42, [], {}].forEach((value: any) => {
        let action = new Action(name, href, { title: value });
        expect(action.title).toBeUndefined();

        action = new Action(name, href, { title });
        action.title = value;
        expect(action.title).toEqual(title);
      });
    });

    it('should allow undefined and coerce null to undefined', () => {
      [undefined, null].forEach((value: any) => {
        let action = new Action(name, href, { title: value });
        expect(action.title).toBeUndefined();

        action = new Action(name, href, { title });
        action.title = value;
        expect(action.title).toBeUndefined();
      });
    });
  });

  describe('type', () => {
    const type = 'application/x-www-form-urlencoded';

    it('should accept any media type string', () => {
      [type, 'text/plain', 'multipart/form-data'].forEach((value) => {
        let action = new Action(name, href, { type: value });
        expect(action.type).toEqual(value);

        action = new Action(name, href);
        action.type = value;
        expect(action.type).toEqual(value);
      });
    });

    it('should ignore invalid media type string', () => {
      [true, 42, 'foo', [], {}].forEach((value: any) => {
        let action = new Action(name, href, { type: value });
        expect(action.type).toBeUndefined();

        action = new Action(name, href, { type });
        action.type = value;
        expect(action.type).toEqual(type);
      });
    });

    it('should allow undefined and coerce null to undefined', () => {
      [undefined, null].forEach((value: any) => {
        let action = new Action(name, href, { type: value });
        expect(action.type).toBeUndefined();

        action = new Action(name, href, { type });
        action.type = value;
        expect(action.type).toBeUndefined();
      });
    });
  });

  describe('getFieldByName', () => {
    it('should return field if it exists', () => {
      const action = new Action(name, href, {
        fields: [{ name: 'foo' }]
      });

      const field = action.getFieldByName('foo');

      expect(field).toBeInstanceOf(Field);
      expect(field?.name).toBe('foo');
    });

    it('should return undefined if field does not exist', () => {
      const action = new Action(name, href, {
        fields: [{ name: 'foo' }]
      });

      const field = action.getFieldByName('bar');

      expect(field).toBeUndefined();
    });

    it('should return undefined if there are no fields', () => {
      const action = new Action(name, href);

      const field = action.getFieldByName('foo');

      expect(field).toBeUndefined();
    });

    it('should return field if it is added', () => {
      const action = new Action(name, href);
      expect(action.getFieldByName('foo')).toBeUndefined();

      action.fields = <any[]>[{ name: 'foo' }];
      expect(action.getFieldByName('foo')).toBeDefined();
    });

    it('should return undefined if field is removed', () => {
      const action = new Action(name, href, {
        fields: [{ name: 'foo' }]
      });
      expect(action.getFieldByName('foo')).toBeDefined();

      action.fields = undefined;
      expect(action.getFieldByName('foo')).toBeUndefined();
    });
  });

  describe('getFieldsByClass', () => {
    const action = new Action('foo', '/foo', {
      fields: [
        { name: 'foo', class: ['foo', 'bar'] },
        { name: 'bar', class: ['foo', 'baz'] },
        { name: 'baz', class: ['qux', 'baz'] },
        { name: 'qux', class: ['grault', 'garply'] }
      ]
    });

    it('should throw when given no args', () => {
      expect(() => action.getFieldsByClass()).toThrow();
    });

    it('should return fields with class', () => {
      expect(action.getFieldsByClass('foo')).toHaveLength(2);
      expect(action.getFieldsByClass('bar')).toHaveLength(1);
      expect(action.getFieldsByClass('baz')).toHaveLength(2);
    });

    it('should return fields with all the given classes', () => {
      expect(action.getFieldsByClass('foo', 'baz')).toHaveLength(1);
      expect(action.getFieldsByClass('baz', 'foo')).toHaveLength(1);
    });

    it('should return empty when no sub-entities with rel(s) exist', () => {
      expect(action.getFieldsByClass('author')).toHaveLength(0);
      expect(action.getFieldsByClass('foo', 'qux')).toHaveLength(0);
    });

    it('should return empty when action is removed', () => {
      const action = new Action('foo', '/foo', {
        fields: [{ name: 'foo', class: ['foo'] }]
      });
      expect(action.getFieldsByClass('foo')).toHaveLength(1);

      action.fields = undefined;
      expect(action.getFieldsByClass('foo')).toHaveLength(0);
    });
  });

  describe('isValid', () => {
    it('should return true if object is parsable', () => {
      const actual = Action.isValid({ name, href });

      expect(actual).toBe(true);
    });

    it('should return false if object is not parsable', () => {
      const actions = [
        {},
        { name },
        { href },
        { name: 42, href },
        { name, href: 'http://\uFFFF.com' }
      ];

      actions.forEach((value) => expect(Action.isValid(value)).toBe(false));
    });
  });

  it('should allow extensions', () => {
    const encoding = 'UTF-16';

    const action = new Action(name, href, { encoding });

    expect(action.encoding).toEqual(encoding);
  });

  test('serialization', () => {
    const action = new Action(name, href, {
      class: ['order'],
      fields: [
        { name: 'orderNumber', type: 'hidden', value: '42' },
        { name: 'quantity', type: 'number' },
        { name: 'productCode' }
      ],
      method: 'POST',
      title: 'Add Item',
      type: 'application/x-www-form-urlencoded',
      encoding: 'UTF-16'
    });

    const json = JSON.stringify(action, null, 2);

    expect(json).toMatchSnapshot();
  });
});
