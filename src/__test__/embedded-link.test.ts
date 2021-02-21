import * as Siren from '../embedded-link';

const href = 'http://example.com';

describe('embeddedLink function', () => {
    it('should coerce rel parameter to string array', () => {
        const cases = [
            [['self'], ['self']],
            [['collection', 'up'], ['collection', 'up']],
            [[], []],
            [undefined, []],
            [null, []],
            [true, ['true']],
            [42, ['42']],
            ['foo', ['foo']],
            [[true, 42, 'foo'], ['true', '42', 'foo']],
            [{}, ['[object Object]']]
        ];

        cases.forEach(([value, expected]) => {
            const link = Siren.embeddedLink(value as string, href);
            expect(link.rel).toEqual(expected);
        });
    });

    describe('href parameter', () => {
        it('should coerce to URI string', () => {
            const cases = [
                [href, href],
                ['/orders', '/orders'],
                [new URL(href), `${href}/`],
                [true, '/true'],
                [42, '/42'],
                ['foo', '/foo'],
                [[true, 42, 'foo'], '/true,42,foo'],
                [{}, '/[object%20Object]']
            ];

            cases.forEach(([value, expected]) => {
                const action = Siren.embeddedLink('create', value as string);
                expect(action.href).toEqual(expected);
            });
        });

        it('should reject invalid URI', () => {
            [null, undefined, 'http://\uFFFF.com'].forEach(value => {
                expect(() => Siren.embeddedLink('create', value as string)).toThrow(TypeError);
            });
        });
    });

    describe('optional parameter', () => {
        it('should set optional members to undefined when empty', () => {
            const rel = ['self'];

            const link = Siren.embeddedLink(rel, href);

            expect(link.rel).toEqual(rel);
            expect(link.href).toEqual(href);
            expect(link.class).toBeUndefined();
            expect(link.title).toBeUndefined();
            expect(link.type).toBeUndefined();
        });

        it('should coerce class option to string array or undefined', () => {
            const cases = [
                [['order'], ['order']],
                [['customer', 'info'], ['customer', 'info']],
                [[], []],
                [undefined, undefined],
                [null, undefined],
                [true, ['true']],
                [42, ['42']],
                ['foo', ['foo']],
                [[true, 42, 'foo'], ['true', '42', 'foo']],
                [{}, ['[object Object]']]
            ];

            cases.forEach(([value, expected]) => {
                const link = Siren.embeddedLink(['self'], href, { class: value as string });
                expect(link.class).toEqual(expected);
            });
        });

        it('should coerce title option to string or undefined', () => {
            const cases = [
                ['foo', 'foo'],
                ['foo bar', 'foo bar'],
                ['', ''],
                [undefined, undefined],
                [null, undefined],
                [true, 'true'],
                [42, '42'],
                [[true, 42, 'foo'], 'true,42,foo'],
                [{}, '[object Object]']
            ];

            cases.forEach(([value, expected]) => {
                const link = Siren.embeddedLink(['self'], href, { title: value as string });
                expect(link.title).toEqual(expected);
            });
        });

        describe('type option', () => {
            it('should accept any valid media type string', () => {
                ['application/json', 'text/html', 'image/png'].forEach(type => {
                    const link = Siren.embeddedLink(['self'], href, { type });
                    expect(link.type).toEqual(type);
                });
            });

            it('should coerce invalid media type string to undefined', () => {
                [undefined, null, true, 42, '', 'foo', [true, 42, 'foo'], {}].forEach(value => {
                    const link = Siren.embeddedLink(['self'], href, { type: value as string });
                    expect(link.type).toBeUndefined();
                });
            });
        });

        it('should accept extensions', () => {
            const hreflang = 'en-US';

            const link = Siren.embeddedLink(['self'], href, { hreflang });

            expect(link.hreflang).toEqual(hreflang);
        });
    });

    it('should create immutable object', () => {
        const link = Siren.embeddedLink(['self'], href, {
            class: ['order'],
            title: 'Order',
            type: 'application/vnd.siren+json',
            hreflang: 'en-US'
        });

        const mutations: ((link: Siren.EmbeddedLink) => void)[] = [
            link => (link.rel as string[]) = ['foo'],
            link => (link.rel as string[])[0] = 'foo',
            link => (link.href as string) = 'foo',
            link => (link.class as string[]) = ['foo'],
            link => (link.class as string[])[0] = 'foo',
            link => (link.title as string) = 'foo',
            link => (link.type as string) = 'foo',
            link => (link.hreflang as string) = 'foo'
        ];

        mutations.forEach(mutate => {
            expect(() => mutate(link)).toThrow(TypeError);
        });
    });
});

describe('embedded link type guard', () => {
    it('should return true for valid links', () => {
        const values: Siren.EmbeddedLink[] = [
            // minimal, absolute URI
            { rel: ['self'], href },
            // minimal, relative URI
            { rel: ['self'], href: '/orders' },
            // kitchen sink
            {
                rel: ['self'],
                href,
                class: ['order'],
                title: 'Order 66',
                type: 'application/xhtml+xml'
            },
            // with extension
            { rel: ['self'], href, hreflang: 'en-US' }
        ];

        values.forEach(value => {
            expect(Siren.isEmbeddedLink(value)).toEqual(true);
        });
    });

    it('should return false for invalid links', () => {
        const values = [
            // non-records
            undefined, null, true, 42, 'foo', [],
            // empty record
            {},
            // invalid rel
            { rel: 'self', href },
            // invalid href
            { rel: ['self'], href: 'http://\uFFFF.com' },
            { rel: ['self'], href: {} },
            // invalid class
            { rel: ['self'], href, class: 'order' },
            // invalid title
            { rel: ['self'], href, title: 42 },
            // invalid type
            { rel: ['self'], href, type: 'order' }
        ];

        values.forEach(value => {
            expect(Siren.isEmbeddedLink(value)).toEqual(false);
        });
    });
});
