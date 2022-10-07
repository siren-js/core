import '../test/setup';

import { Action } from './Action';
import { EmbeddedEntity, EmbeddedEntityLike } from './EmbeddedEntity';
import { EmbeddedLink } from './EmbeddedLink';
import { Field } from './Field';
import { Link } from './Link';
import { ValidationError } from './utils';

describe('EmbeddedEntity', () => {
  const rel = ['item'];

  it('should require nothing', () => {
    const entity: EmbeddedEntityLike = {
      rel: ['item'],
      class: ['order'],
      properties: {
        orderNumber: 42,
        itemCount: 3,
        status: 'pending'
      },
      entities: [
        {
          rel: ['http://x.io/rels/order-items'],
          href: 'http://api.x.io/orders/42/items'
        },
        {
          rel: ['http://x.io/rels/customer'],
          links: [{ rel: ['self'], href: 'http://api.x.io/customers/pj123' }]
        }
      ],
      actions: [
        {
          name: 'add-item',
          title: 'Add Item',
          method: 'POST',
          href: 'http://api.x.io/orders/42/items',
          type: 'application/x-www-form-urlencoded',
          fields: [{ name: 'orderNumber', type: 'hidden', value: '42' }]
        }
      ],
      links: [{ rel: ['self'], href: 'http://api.x.io/orders/42' }]
    };

    const result = EmbeddedEntity.of(entity);

    expect(result).toEqual(entity);
    expect(result).toBeInstanceOf(EmbeddedEntity);
    expect(result.entities?.[0]).toBeInstanceOf(EmbeddedLink);
    expect(result.entities?.[1]).toBeInstanceOf(EmbeddedEntity);
    expect(result.actions?.[0]).toBeInstanceOf(Action);
    expect(result.actions?.[0].fields?.[0]).toBeInstanceOf(Field);
    expect(result.links?.[0]).toBeInstanceOf(Link);
  });

  it('should valid known properties', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const entity: EmbeddedEntityLike = {
      actions: [{ name: <any>1, href: <any>2 }],
      class: <any>3,
      entities: [{ rel: <any>4, href: <any>5 }],
      links: [{ href: <any>4, rel: <any>5 }],
      properties: <any>6,
      rel: <any>7,
      title: <any>8
    };
    /* eslint-enable @typescript-eslint/no-explicit-any */

    try {
      EmbeddedEntity.of(entity);
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).errors).toHaveLength(Object.keys(entity).length);
    }
  });

  describe('findActionByName', () => {
    const entity = EmbeddedEntity.of({
      rel,
      actions: [
        { name: 'foo', href: 'https://api.example.com/foo' },
        { name: 'bar', href: 'https://api.example.com/bar' }
      ]
    });

    it('should return Action with the given name', () => {
      expect(entity.findActionByName('foo')).toEqual(entity.actions?.[0]);
      expect(entity.findActionByName('bar')).toEqual(entity.actions?.[1]);
    });

    it('should return undefined if no Action matches', () => {
      expect(entity.findActionByName('baz')).toBeUndefined();
    });

    it('should return undefined if entity has no actions', () => {
      const entity = EmbeddedEntity.of({ rel });

      expect(entity.findActionByName('missing')).toBeUndefined();
    });
  });

  describe('findEntitiesByRel', () => {
    const entity = EmbeddedEntity.of({
      rel,
      entities: [
        { rel: ['item', 'next'], href: 'https://api.example.com/items/2' },
        { rel: ['item', 'prev'], href: 'https://api.example.com/items/3' },
        { rel: ['about'], links: [{ rel: ['self'], href: 'https://api.example.com/about' }] }
      ]
    });

    it('should return all matching fields', () => {
      expect(entity.findEntitiesByRel('item')).toStrictEqual(entity.entities?.slice(0, 2));
      expect(entity.findEntitiesByRel('about')).toStrictEqual(entity.entities?.slice(2, 3));
    });

    it('should only return fields with all given classes', () => {
      const result = entity.findEntitiesByRel('item', 'next');

      expect(result).toStrictEqual([entity.entities?.[0]]);
    });

    it('should return empty array when no fields match', () => {
      const result = entity.findEntitiesByRel('missing');

      expect(result).toHaveLength(0);
    });

    it('should return empty array when entity has no sub-entities', () => {
      const entity = EmbeddedEntity.of({ rel });

      const result = entity.findEntitiesByRel('missing');

      expect(result).toHaveLength(0);
    });
  });

  describe('findLinksByRel', () => {
    const entity = EmbeddedEntity.of({
      rel,
      links: [
        { rel: ['item', 'next'], href: 'https://api.example.com/items/2' },
        { rel: ['item', 'prev'], href: 'https://api.example.com/items/3' },
        { rel: ['about'], href: 'https://api.example.com/about' }
      ]
    });

    it('should return all matching fields', () => {
      expect(entity.findLinksByRel('item')).toStrictEqual(entity.links?.slice(0, 2));
      expect(entity.findLinksByRel('about')).toStrictEqual(entity.links?.slice(2, 3));
    });

    it('should only return fields with all given classes', () => {
      const result = entity.findLinksByRel('item', 'next');

      expect(result).toStrictEqual([entity.links?.[0]]);
    });

    it('should return empty array when no fields match', () => {
      const result = entity.findLinksByRel('missing');

      expect(result).toHaveLength(0);
    });

    it('should return empty array when entity has no sub-entities', () => {
      const entity = EmbeddedEntity.of({ rel });

      const result = entity.findLinksByRel('missing');

      expect(result).toHaveLength(0);
    });
  });
});
