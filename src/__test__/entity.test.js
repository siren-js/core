import { Entity, Link } from '../entity';

describe('Entity constructor', () => {
    it('should accept no arguments', () => {
        expect(() => new Entity()).not.toThrow(TypeError);
    });

    it('should handle null options gracefully', () => {
        expect(() => new Entity(null)).not.toThrow();
    });
});

describe('Entity.class', () => {
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

describe('Entity.links', () => {
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
            const entity = new Entity({ links: value });
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

describe('Entity.properties', () => {
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
});

