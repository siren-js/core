import * as Siren from '../link';

const href = 'http://example.com';

describe('link function', () => {
    it('should create Link from rel and href', () => {
        const rel = ['self'];

        const link = Siren.link(rel, href);

        expect(link.rel).toEqual(rel);
        expect(link.href).toEqual(href);
        expect(link.class).toBeUndefined();
        expect(link.title).toBeUndefined();
        expect(link.type).toBeUndefined();
    });

    it('should accept optional members as object', () => {
        const rel = ['self'];
        const cls = ['order'];
        const title = 'Order';
        const type = 'application/vnd.siren+json';

        const link = Siren.link(['self'], href, { class: cls, title, type });

        expect(link.rel).toEqual(rel);
        expect(link.href).toEqual(href);
        expect(link.class).toEqual(cls);
        expect(link.title).toEqual(title);
        expect(link.type).toEqual(type);
    });

    it('should accept extensions', () => {
        const hreflang = 'en-US';

        const link = Siren.link(['self'], href, { hreflang });

        expect(link.hreflang).toEqual(hreflang);
    });

    it('should create immutable object', () => {
        const link = Siren.link(['self'], href, {
            class: ['order'],
            title: 'Order',
            type: 'application/vnd.siren+json',
            hreflang: 'en-US'
        });

        const mutations: ((link: Siren.Link) => void)[] = [
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

    describe('rel parameter', () => {
        it('should accept any string array', () => {
            [[], ['self'], ['collection', 'up']].forEach(value => {
                const link = Siren.link(value, href);
                expect(link.rel).toEqual(value);
            });
        });

        it('should coerce to string array', () => {
            const cases = [
                [undefined, []],
                [null, []],
                [true, ['true']],
                [69, ['69']],
                ['foo', ['foo']],
                [[true, 69, 'foo'], ['true', '69', 'foo']],
                [{}, ['[object Object]']]
            ];

            cases.forEach(([value, expected]) => {
                const link = Siren.link(value as string, href);
                expect(link.rel).toEqual(expected);
            });
        });
    });

    describe('href parameter', () => {
        it('should accept absolute and relative URIs', () => {
            [href, '/orders'].forEach(uri => {
                const link = Siren.link(['self'], uri);
                expect(link.href).toEqual(uri);
            });
        });

        it('should add leading slash to relative URIs', () => {
            const uri = 'orders/69';

            const link = Siren.link(['self'], uri);

            expect(link.href).toEqual(`/${uri}`);
        });

        it('should coerce URL object to string', () => {
            const url = new URL(href);

            const link = Siren.link(['self'], url);

            expect(link.href).toEqual(url.toString());
        });

        it('should coerce href value to string', () => {
            const cases = [
                [true, '/true'],
                [69, '/69'],
                [[true, 69, 'foo'], '/true,69,foo'],
                [{}, '/[object%20Object]']
            ];

            cases.forEach(([value, expected]) => {
                const link = Siren.link(['self'], value as string);
                expect(link.href).toEqual(expected);
            });
        });

        it('should reject invalid URI', () => {
            [null, undefined, 'http://\uFFFF.com'].forEach(value => {
                expect(() => Siren.link(['self'], value as string)).toThrow(TypeError);
            });
        });
    });

    describe('class option', () => {
        it('should accept any string array', () => {
            [[], ['order'], ['customer', 'info']].forEach(value => {
                const link = Siren.link(['self'], href, { class: value });
                expect(link.class).toEqual(value);
            });
        });

        it('should coerce to string array or undefined', () => {
            const cases = [
                [undefined, undefined],
                [null, undefined],
                [true, ['true']],
                [69, ['69']],
                ['foo', ['foo']],
                [[true, 69, 'foo'], ['true', '69', 'foo']],
                [{}, ['[object Object]']]
            ];

            cases.forEach(([value, expected]) => {
                const link = Siren.link(['self'], href, { class: value as string });
                expect(link.class).toEqual(expected);
            });
        });
    });

    describe('title option', () => {
        it('should accept any string value', () => {
            ['', 'foo', 'foo bar'].forEach(value => {
                const link = Siren.link(['self'], href, { title: value });
                expect(link.title).toEqual(value);
            });
        });

        it('should coerce to string or undefined', () => {
            const cases = [
                [undefined, undefined],
                [null, undefined],
                [true, 'true'],
                [69, '69'],
                ['foo', 'foo'],
                [[true, 69, 'foo'], 'true,69,foo'],
                [{}, '[object Object]']
            ];

            cases.forEach(([value, expected]) => {
                const link = Siren.link(['self'], href, { title: value as string });
                expect(link.title).toEqual(expected);
            });
        });
    });

    describe('type option', () => {
        it('should accept any valid media type string', () => {
            ['application/json', 'text/html', 'image/png'].forEach(type => {
                const link = Siren.link(['self'], href, { type });
                expect(link.type).toEqual(type);
            });
        });

        it('should coerce to invalid media type string to undefined', () => {
            [undefined, null, true, 69, '', 'foo', [true, 69, 'foo'], {}].forEach(value => {
                const link = Siren.link(['self'], href, { type: value as string });
                expect(link.type).toBeUndefined;
            });
        });
    });
});

describe('link type guard', () => {
    it('should return true for valid links', () => {
        const values: Siren.Link[] = [
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
            expect(Siren.isLink(value)).toEqual(true);
        });
    });

    it('should return false for invalid links', () => {
        const values = [
            // non-records
            undefined, null, true, 69, 'foo', [],
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
            { rel: ['self'], href, title: 420 },
            // invalid type
            { rel: ['self'], href, type: 'order' }
        ];

        values.forEach(value => {
            expect(Siren.isLink(value)).toEqual(false);
        });
    });
});
