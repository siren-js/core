import { Action, EmbeddedLink, EmbeddedEntity, Entity, Link } from '../entity';

describe('Entity', () => {
  describe('constructor', () => {
    it('should accept no arguments', () => {
      expect(() => new Entity()).not.toThrow(TypeError);
    });

    it('should handle null options gracefully', () => {
      expect(() => new Entity(null)).not.toThrow();
    });
  });

  describe('actions', () => {
    const name = 'add-item';
    const href = 'http://example.com';

    it('should accept empty array', () => {
      const actions = [];

      const entity = new Entity({ actions });

      expect(entity.actions).toEqual(actions);
      expect(Object.isFrozen(entity.actions)).toBe(true);
    });

    it('should accept array of actions', () => {
      const actions = [
        new Action(name, href, { method: 'POST', title: 'Add Item' }),
        {
          name: 'search',
          href: 'http://example.com/search',
          title: 'Search'
        }
      ];

      const entity = new Entity({ actions });

      expect(entity.actions).toHaveLength(actions.length);
      expect(entity.actions[0]).toBe(actions[0]);
      expect(entity.actions[1]).toBeInstanceOf(Action);
      expect(entity.actions[1].name).toEqual(actions[1].name);
      expect(entity.actions[1].href).toEqual(actions[1].href);
      expect(entity.actions[1].title).toEqual(actions[1].title);
      expect(Object.isFrozen(entity.actions)).toBe(true);
    });

    it('should remove duplicates', () => {
      const entity = new Entity({
        actions: [
          { name, href },
          { name, href, method: 'POST' }
        ]
      });

      expect(entity.actions).toHaveLength(1);
      expect(entity.actions[0].method).toBeUndefined();
    });

    it('should allow undefined and coerce null', () => {
      [undefined, null].forEach((value) => {
        let entity = new Entity({ actions: value });
        expect(entity.actions).toBeUndefined();

        entity = new Entity({ actions: [] });
        entity.actions = value;
        expect(entity.actions).toBeUndefined();
      });
    });

    it('should filter invalid actions', () => {
      const entity = new Entity({
        actions: [{}, { name }, { href }]
      });

      expect(entity.actions).toHaveLength(0);
    });

    it('should ignore non-array value', () => {
      const actions = [new Action(name, href)];
      [true, 42, {}].forEach((value) => {
        let entity = new Entity({ actions: value });
        expect(entity.actions).toBeUndefined();

        entity = new Entity({ actions });
        entity.actions = value;
        expect(entity.actions).toEqual(actions);
      });
    });
  });

  describe('class', () => {
    it('should accept any array of strings', () => {
      [['order'], ['customer', 'info'], []].forEach((value) => {
        let entity = new Entity({ class: value });
        expect(entity.class).toEqual(value);
      });
    });

    it('should coerce string to singleton array', () => {
      ['person', ''].forEach((value) => {
        const entity = new Entity({ class: value });
        expect(entity.class).toEqual([value]);
      });
    });

    it('should allow undefined and coerce null', () => {
      [undefined, null].forEach((value) => {
        const entity = new Entity({ class: value });
        expect(entity.class).toBeUndefined();
      });
    });

    it('should remove non-strings from array', () => {
      const entity = new Entity({
        class: [true, 42, 'person', null, undefined]
      });

      expect(entity.class).toEqual(['person']);
    });

    it('should ignore invalid value', () => {
      [true, 42, {}].forEach((value) => {
        const entity = new Entity({ class: value });
        expect(entity.class).toBeUndefined();
      });
    });

    it('should be frozen', () => {
      const entity = new Entity({ class: ['order'] });

      expect(Object.isFrozen(entity.class)).toBe(true);
    });
  });

  describe('entities', () => {
    it('should accept empty array', () => {
      const entities = [];

      const entity = new Entity({ entities });

      expect(entity.entities).toEqual([]);
      expect(Object.isFrozen(entity.entities)).toBe(true);
    });

    const rel = ['item'];
    const href = 'http://example.com';

    it('should accept array of sub-entities', () => {
      const entities = [
        new EmbeddedLink(rel, `${href}/1`, { title: 'Item 1' }),
        {
          rel,
          href: `${href}/2`,
          title: 'Item 2'
        },
        new EmbeddedEntity(rel, {
          title: 'Item 3',
          links: [{ rel: ['self'], href: `${href}/3` }]
        }),
        {
          rel,
          title: 'Item 4',
          links: [{ rel: ['self'], href: `${href}/4` }]
        }
      ];

      const entity = new Entity({ entities });

      expect(entity.entities).toHaveLength(entities.length);
      expect(entity.entities[0]).toBe(entities[0]);
      expect(entity.entities[1]).toBeInstanceOf(EmbeddedLink);
      expect(entity.entities[1].rel).toEqual(entities[1].rel);
      expect(entity.entities[1].href).toEqual(entities[1].href);
      expect(entity.entities[1].title).toEqual(entities[1].title);
      expect(entity.entities[2]).toBe(entities[2]);
      expect(entity.entities[3]).toBeInstanceOf(EmbeddedEntity);
      expect(entity.entities[3].rel).toEqual(entities[3].rel);
      expect(entity.entities[3].href).toEqual(entities[3].href);
      expect(entity.entities[3].title).toEqual(entities[3].title);
      expect(Object.isFrozen(entity.entities)).toBe(true);
    });

    it('should allow undefined and coerce null', () => {
      [undefined, null].forEach((value) => {
        let entity = new Entity({ entities: value });
        expect(entity.entities).toBeUndefined();

        entity = new Entity({ entities: [] });
        entity.entities = value;
        expect(entity.entities).toBeUndefined();
      });
    });

    it('should filter invalid sub-entities', () => {
      const entity = new Entity({
        entities: [{}, { href }, { links: [{ rel: ['self'], href }] }]
      });

      expect(entity.entities).toEqual([]);
    });

    it('should ignore non-array value', () => {
      const entities = [
        new EmbeddedLink(rel, href),
        new EmbeddedEntity(['item'], {
          links: [{ rel: ['self'], href }]
        })
      ];
      [true, 42, {}].forEach((value) => {
        let entity = new Entity({ entities: value });
        expect(entity.entities).toBeUndefined();

        entity = new Entity({ entities });
        entity.entities = value;
        expect(entity.entities).toEqual(entities);
      });
    });
  });

  describe('links', () => {
    const rel = ['self'];
    const href = 'http://example.com';

    it('should accept empty array', () => {
      const links = [];

      const entity = new Entity({ links });

      expect(entity.links).toEqual([]);
      expect(Object.isFrozen(entity.links)).toBe(true);
    });

    it('should accept array of links', () => {
      const links = [
        new Link(rel, href, { title: 'Home' }),
        { rel: ['about'], href: 'http://example.com/about', title: 'About' }
      ];

      const entity = new Entity({ links });

      expect(entity.links).toHaveLength(links.length);
      expect(entity.links[0]).toBe(links[0]);
      expect(entity.links[1]).toBeInstanceOf(Link);
      expect(entity.links[1].rel).toEqual(links[1].rel);
      expect(entity.links[1].href).toEqual(links[1].href);
      expect(entity.links[1].title).toEqual(links[1].title);
      expect(Object.isFrozen(entity.links)).toBe(true);
    });

    it('should allow undefined and coerce null', () => {
      [undefined, null].forEach((value) => {
        let entity = new Entity({ links: value });
        expect(entity.links).toBeUndefined();

        entity = new Entity({ links: [] });
        entity.links = value;
        expect(entity.links).toBeUndefined();
      });
    });

    it('should filter invalid links', () => {
      const entity = new Entity({
        links: [{}, { rel }, { href }]
      });

      expect(entity.links).toHaveLength(0);
    });

    it('should ignore non-array value', () => {
      const links = [new Link(rel, href)];
      [true, 42, {}].forEach((value) => {
        let entity = new Entity({ links: value });
        expect(entity.links).toBeUndefined();

        entity = new Entity({ links });
        entity.links = value;
        expect(entity.links).toEqual(links);
      });
    });
  });

  describe('properties', () => {
    it('should accept any record', () => {
      const properties = {
        foo: 'bar',
        bar: 42,
        baz: ['foo', 'bar', 'baz']
      };

      const entity = new Entity({ properties });

      expect(entity.properties).toEqual(properties);
    });

    it('should ignore non-records', () => {
      [true, 42, 'foo', [true, 42, 'foo']].forEach((value) => {
        const entity = new Entity({ properties: value });
        expect(entity.properties).toBeUndefined();
      });
    });

    it('should allow undefined and coerce null', () => {
      [undefined, null].forEach((value) => {
        let entity = new Entity({ properties: value });
        expect(entity.properties).toBeUndefined();

        entity = new Entity({ properties: [] });
        entity.properties = value;
        expect(entity.properties).toBeUndefined();
      });
    });
  });

  describe('title', () => {
    const title = 'This is an Entity';

    it('should accept any string', () => {
      [title, 'Å Fâñçÿ Títlè', ''].forEach((value) => {
        let entity = new Entity({ title: value });
        expect(entity.title).toEqual(value);

        entity = new Entity();
        entity.title = value;
        expect(entity.title).toEqual(value);
      });
    });

    it('should ignore non-string value', () => {
      [true, 42, [], {}].forEach((value) => {
        let entity = new Entity({ title: value });
        expect(entity.title).toBeUndefined();

        entity = new Entity({ title });
        entity.title = value;
        expect(entity.title).toEqual(title);
      });
    });

    it('should allow undefined and coerce null to undefined', () => {
      [undefined, null].forEach((value) => {
        let entity = new Entity({ title: value });
        expect(entity.title).toBeUndefined();

        entity = new Entity({ title });
        entity.title = value;
        expect(entity.title).toBeUndefined();
      });
    });
  });

  describe('getActionByName', () => {
    it('should return action if it exists', () => {
      const entity = new Entity({
        actions: [{ name: 'foo', href: '/foo' }]
      });

      const action = entity.getActionByName('foo');

      expect(action).toBeInstanceOf(Action);
      expect(action.name).toBe('foo');
      expect(action.href).toBe('/foo');
    });

    it('should return undefined if action does not exist', () => {
      const entity = new Entity({
        actions: [{ name: 'foo', href: '/foo' }]
      });

      const action = entity.getActionByName('bar');

      expect(action).toBeUndefined();
    });

    it('should return undefined if there are no actions', () => {
      const entity = new Entity();

      const action = entity.getActionByName('foo');

      expect(action).toBeUndefined();
    });

    it('should return action if it is added', () => {
      const entity = new Entity();
      expect(entity.getActionByName('foo')).toBeUndefined();

      entity.actions = [{ name: 'foo', href: '/foo' }];
      expect(entity.getActionByName('foo')).toBeDefined();
    });

    it('should return undefined if action is removed', () => {
      const entity = new Entity({
        actions: [{ name: 'foo', href: '/foo' }]
      });
      expect(entity.getActionByName('foo')).toBeDefined();

      entity.actions = undefined;
      expect(entity.getActionByName('foo')).toBeUndefined();
    });
  });

  describe('getActionsByClass', () => {
    const entity = new Entity({
      actions: [
        { name: 'foo', href: '/foo/1', class: ['foo', 'bar'] },
        { name: 'bar', href: '/foo/2', class: ['foo', 'baz'] },
        { name: 'baz', href: '/foo/3', class: ['qux', 'baz'] },
        { name: 'qux', href: '/foo/4', class: ['grault', 'garply'] }
      ]
    });

    it('should throw when given no args', () => {
      expect(() => entity.getActionsByClass()).toThrow();
    });

    it('should return actions with class', () => {
      expect(entity.getActionsByClass('foo')).toHaveLength(2);
      expect(entity.getActionsByClass('bar')).toHaveLength(1);
      expect(entity.getActionsByClass('baz')).toHaveLength(2);
    });

    it('should return actions with all the given classes', () => {
      expect(entity.getActionsByClass('foo', 'baz')).toHaveLength(1);
    });

    it('should return empty when no actions with class(es) exist', () => {
      expect(entity.getActionsByClass('author')).toHaveLength(0);
      expect(entity.getActionsByClass('foo', 'qux')).toHaveLength(0);
    });

    it('should return empty when action is removed', () => {
      const entity = new Entity({
        actions: [{ name: 'foo', href: '/foo/1', class: ['foo'] }]
      });
      expect(entity.getActionsByClass('foo')).toHaveLength(1);

      entity.actions = undefined;
      expect(entity.getActionsByClass('foo')).toHaveLength(0);
    });
  });

  describe('getEntitiesByClass', () => {
    const entity = new Entity({
      entities: [
        { rel: ['item'], href: '/foo/1', class: ['foo', 'bar'] },
        { rel: ['item'], href: '/foo/2', class: ['foo', 'baz'] },
        { rel: ['item'], href: '/foo/3', class: ['qux', 'baz'] },
        { rel: ['item'], href: '/foo/4', class: ['grault', 'garply'] }
      ]
    });

    it('should throw when given no args', () => {
      expect(() => entity.getEntitiesByClass()).toThrow();
    });

    it('should return sub-entities with class', () => {
      expect(entity.getEntitiesByClass('foo')).toHaveLength(2);
      expect(entity.getEntitiesByClass('bar')).toHaveLength(1);
      expect(entity.getEntitiesByClass('baz')).toHaveLength(2);
    });

    it('should return sub-entities with all the given classes', () => {
      expect(entity.getEntitiesByClass('foo', 'baz')).toHaveLength(1);
    });

    it('should return empty when no sub-entities with class(es) exist', () => {
      expect(entity.getEntitiesByClass('author')).toHaveLength(0);
      expect(entity.getEntitiesByClass('foo', 'qux')).toHaveLength(0);
    });

    it('should return empty when sub-entity is removed', () => {
      const entity = new Entity({
        entities: [{ rel: ['item'], href: '/foo/1', class: ['foo'] }]
      });
      expect(entity.getEntitiesByClass('foo')).toHaveLength(1);

      entity.entities = undefined;
      expect(entity.getEntitiesByClass('foo')).toHaveLength(0);
    });
  });

  describe('getEntitiesByRel', () => {
    const entity = new Entity({
      entities: [
        { rel: ['collection'], href: '/foos' },
        { rel: ['collection', 'up'], href: '/bars' },
        { rel: ['about'], href: '/about' }
      ]
    });

    it('should throw when given no args', () => {
      expect(() => entity.getEntitiesByRel()).toThrow();
    });

    it('should return sub-entities with rel', () => {
      expect(entity.getEntitiesByRel('collection')).toHaveLength(2);
      expect(entity.getEntitiesByRel('up')).toHaveLength(1);
      expect(entity.getEntitiesByRel('about')).toHaveLength(1);
    });

    it('should return sub-entities with all the given rels', () => {
      expect(entity.getEntitiesByRel('collection', 'up')).toHaveLength(1);
      expect(entity.getEntitiesByRel('up', 'collection')).toHaveLength(1);
    });

    it('should return empty when no sub-entities with rel(s) exist', () => {
      expect(entity.getEntitiesByRel('author')).toHaveLength(0);
      expect(entity.getEntitiesByRel('collection', 'index')).toHaveLength(0);
    });

    it('should return empty when sub-entity is removed', () => {
      const entity = new Entity({
        entities: [{ rel: ['item'], href: '/foo' }]
      });
      expect(entity.getEntitiesByRel('item')).toHaveLength(1);

      entity.entities = undefined;
      expect(entity.getEntitiesByRel('item')).toHaveLength(0);
    });
  });

  describe('getLinksByClass', () => {
    const entity = new Entity({
      links: [
        { rel: ['self'], href: '/foo', class: ['foo', 'bar'] },
        { rel: ['collection'], href: '/', class: ['foo', 'baz'] },
        { rel: ['about'], href: '/about', class: ['qux', 'baz'] },
        { rel: ['author'], href: '/author', class: ['grault', 'garply'] }
      ]
    });

    it('should throw when given no args', () => {
      expect(() => entity.getLinksByClass()).toThrow();
    });

    it('should return links with class', () => {
      expect(entity.getLinksByClass('foo')).toHaveLength(2);
      expect(entity.getLinksByClass('bar')).toHaveLength(1);
      expect(entity.getLinksByClass('baz')).toHaveLength(2);
    });

    it('should return links with all the given classes', () => {
      expect(entity.getLinksByClass('foo', 'baz')).toHaveLength(1);
      expect(entity.getLinksByClass('baz', 'foo')).toHaveLength(1);
    });

    it('should return empty when no links with class(es) exist', () => {
      expect(entity.getLinksByClass('author')).toHaveLength(0);
      expect(entity.getLinksByClass('foo', 'qux')).toHaveLength(0);
    });

    it('should return empty when link is removed', () => {
      const entity = new Entity({
        links: [{ rel: ['self'], href: '/foo', class: ['foo'] }]
      });
      expect(entity.getLinksByClass('foo')).toHaveLength(1);

      entity.links = undefined;
      expect(entity.getLinksByClass('foo')).toHaveLength(0);
    });
  });

  describe('getLinksByRel', () => {
    const entity = new Entity({
      links: [
        { rel: ['collection'], href: '/foos' },
        { rel: ['collection', 'up'], href: '/bars' },
        { rel: ['about'], href: '/about' }
      ]
    });

    it('should throw when given no args', () => {
      expect(() => entity.getLinksByRel()).toThrow();
    });

    it('should return links with rel', () => {
      expect(entity.getLinksByRel('collection')).toHaveLength(2);
      expect(entity.getLinksByRel('up')).toHaveLength(1);
      expect(entity.getLinksByRel('about')).toHaveLength(1);
    });

    it('should return links with all the given rels', () => {
      expect(entity.getLinksByRel('collection', 'up')).toHaveLength(1);
      expect(entity.getLinksByRel('up', 'collection')).toHaveLength(1);
    });

    it('should return empty when no links with rel(s) exist', () => {
      expect(entity.getLinksByRel('author')).toHaveLength(0);
      expect(entity.getLinksByRel('collection', 'index')).toHaveLength(0);
    });

    it('should return empty when link is removed', () => {
      const entity = new Entity({
        links: [{ rel: ['self'], href: '/foo' }]
      });
      expect(entity.getLinksByRel('self')).toHaveLength(1);

      entity.links = undefined;
      expect(entity.getLinksByRel('self')).toHaveLength(0);
    });
  });

  it('should allow extensions', () => {
    const entity = new Entity({ foo: 'bar' });

    expect(entity.foo).toEqual('bar');
  });

  test('serialization', () => {
    const entity = new Entity({
      class: ['order'],
      properties: {
        orderNumber: 42,
        itemCount: 3,
        status: 'pending'
      },
      entities: [
        {
          class: ['items', 'collection'],
          rel: ['http://x.io/rels/order-items'],
          href: 'http://api.x.io/orders/42/items'
        },
        {
          class: ['info', 'customer'],
          rel: ['http://x.io/rels/customer'],
          properties: {
            customerId: 'pj123',
            name: 'Peter Joseph'
          },
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
          fields: [
            { name: 'orderNumber', type: 'hidden', value: '42' },
            { name: 'productCode', type: 'text' },
            { name: 'quantity', type: 'number' }
          ]
        }
      ],
      links: [
        { rel: ['self'], href: 'http://api.x.io/orders/42' },
        { rel: ['previous'], href: 'http://api.x.io/orders/41' },
        { rel: ['next'], href: 'http://api.x.io/orders/43' }
      ],
      foo: 'bar'
    });

    const json = JSON.stringify(entity, null, 2);

    expect(json).toMatchSnapshot();
  });
});

describe('EmbeddedEntity', () => {
  const rel = ['item'];

  it('should be instanceof Entity', () => {
    const embeddedEntity = new EmbeddedEntity(rel);

    expect(embeddedEntity).toBeInstanceOf(EmbeddedEntity);
    expect(embeddedEntity).toBeInstanceOf(Entity);
  });

  describe('rel', () => {
    it('should accept any array of strings', () => {
      [rel, ['collection', 'up'], []].forEach((value) => {
        const embeddedEntity = new EmbeddedEntity(value);
        expect(embeddedEntity.rel).toEqual(value);
      });
    });

    it('should coerce string to singleton array', () => {
      ['item', ''].forEach((value) => {
        const embeddedEntity = new EmbeddedEntity(value);
        expect(embeddedEntity.rel).toEqual([value]);
      });

      const embeddedEntity = new EmbeddedEntity(rel);

      embeddedEntity.rel = 'up';

      expect(embeddedEntity.rel).toEqual(['up']);
    });

    it('should remove non-strings from array', () => {
      const embeddedEntity = new EmbeddedEntity([
        true,
        42,
        'item',
        null,
        undefined
      ]);

      expect(embeddedEntity.rel).toEqual(rel);
    });

    it('should throw TypeError when constructor arg is invalid', () => {
      [undefined, null, true, 42, {}].forEach((value) => {
        expect(() => new EmbeddedEntity(value)).toThrow(TypeError);
      });
    });

    it('should ignore invalid value in setter', () => {
      const embeddedEntity = new EmbeddedEntity(rel);

      [undefined, null, true, 42, {}].forEach((value) => {
        embeddedEntity.rel = value;
        expect(embeddedEntity.rel).toEqual(rel);
      });
    });
  });

  describe('isValid', () => {
    it('should return true if object is parsable', () => {
      [{ rel }, { rel: 'self' }].forEach((value) =>
        expect(EmbeddedEntity.isValid(value)).toBe(true)
      );
    });

    it('should return false if object is not parsable', () => {
      [{}, { rel: 42 }].forEach((value) =>
        expect(EmbeddedEntity.isValid(value)).toBe(false)
      );
    });
  });
});
