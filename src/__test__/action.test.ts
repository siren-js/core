import * as Siren from '../action';

const href = 'http://example.com';

describe('action function', () => {
    it('should coerce name parameter to string', () => {
        const cases = [
            ['foo', 'foo'],
            ['foo bar', 'foo bar'],
            ['', ''],
            [undefined, ''],
            [null, ''],
            [true, 'true'],
            [42, '42'],
            [[true, 42, 'foo'], 'true,42,foo'],
            [{}, '[object Object]']
        ];

        cases.forEach(([value, expected]) => {
            const action = Siren.action(value as string, href);
            expect(action.name).toEqual(expected);
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
                const action = Siren.action('create', value as string);
                expect(action.href).toEqual(expected);
            });
        });

        it('should reject invalid URI', () => {
            [null, undefined, 'http://\uFFFF.com'].forEach(value => {
                expect(() => Siren.action('create', value as string)).toThrow(TypeError);
            });
        });
    });

    describe('optional parameter', () => {
        it('should set optional members to undefined when empty', () => {
            const name = 'create';

            const action = Siren.action(name, href);

            expect(action.name).toEqual(name);
            expect(action.href).toEqual(href);
            expect(action.class).toBeUndefined();
            expect(action.fields).toBeUndefined();
            expect(action.method).toBeUndefined();
            expect(action.title).toBeUndefined();
            expect(action.type).toBeUndefined();
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
                const action = Siren.action('create', href, { class: value as string[] });
                expect(action.class).toEqual(expected);
            });
        });

        it('should coerce method option to string or undefined', () => {
            const cases = [
                ['', ''],
                ['foo', 'foo'],
                ['foo bar', 'foo bar'],
                [undefined, undefined],
                [null, undefined],
                [true, 'true'],
                [42, '42'],
                [[true, 42, 'foo'], 'true,42,foo'],
                [{}, '[object Object]']
            ];

            cases.forEach(([value, expected]) => {
                const action = Siren.action('create', href, { method: value as string });
                expect(action.method).toEqual(expected);
            });
        });

        it('should coerce title option to string or undefined', () => {
            const cases = [
                ['', ''],
                ['foo', 'foo'],
                ['foo bar', 'foo bar'],
                [undefined, undefined],
                [null, undefined],
                [true, 'true'],
                [42, '42'],
                [[true, 42, 'foo'], 'true,42,foo'],
                [{}, '[object Object]']
            ];

            cases.forEach(([value, expected]) => {
                const action = Siren.action('create', href, { title: value as string });
                expect(action.title).toEqual(expected);
            });
        });

        describe('fields option', () => {
            it('should accept array of parsable fields', () => {
                const action = Siren.action('create', href, {
                    fields: [
                        { name: 'foo' },
                        { name: 'bar', type: 'number' },
                        { name: 'baz', class: ['integer'] },
                        { name: 'qux', class: 'integer' },
                        Siren.field('quz')
                    ] as Siren.Field[]
                });

                expect(action.fields).toHaveLength(5);
                expect(action.fields?.[0]).toHaveProperty('name', 'foo');
                expect(action.fields?.[1]).toHaveProperty('name', 'bar');
                expect(action.fields?.[1]).toHaveProperty('type', 'number');
                expect(action.fields?.[2]).toHaveProperty('name', 'baz');
                expect(action.fields?.[2]).toHaveProperty('class', ['integer']);
                expect(action.fields?.[3]).toHaveProperty('name', 'qux');
                expect(action.fields?.[3]).toHaveProperty('class', ['integer']);
                expect(action.fields?.[4]).toHaveProperty('name', 'quz');
            });

            it('should coerce non-array to undefined', () => {
                [null, undefined, true, 42, 'foo', {}].forEach(value => {
                    const action = Siren.action('create', href, { fields: value as Siren.Field[] });
                    expect(action.fields).toBeUndefined();
                });
            });

            it('should ignore invalid items', () => {
                const action = Siren.action('create', href, {
                    fields: [
                        null,
                        undefined,
                        true,
                        42,
                        'foo',
                        { name: 'foo' }
                    ] as Siren.Field[]
                });

                expect(action.fields).toHaveLength(1);
            });

            it('should remove duplicates', () => {
                const action = Siren.action('create', href, {
                    fields: [
                        { name: 'foo', type: 'number' },
                        { name: 'foo', type: 'date' }
                    ]
                });

                expect(action.fields).toHaveLength(1);
                expect(action.fields?.[0]).toHaveProperty('name', 'foo');
                expect(action.fields?.[0]).toHaveProperty('type', 'number');
            });

            it('should be empty if no valid items', () => {
                const action = Siren.action('create', href, {
                    fields: [
                        null,
                        undefined,
                        true,
                        42,
                        'foo'
                    ] as any // eslint-disable-line @typescript-eslint/no-explicit-any
                });

                expect(action.fields).toHaveLength(0);
            });
        });

        describe('type option', () => {
            it('should accept any valid media type string', () => {
                ['application/json', 'text/html', 'image/png'].forEach(type => {
                    const action = Siren.action('create', href, { type });
                    expect(action.type).toEqual(type);
                });
            });

            it('should coerce to invalid media type string to undefined', () => {
                [undefined, null, true, 42, '', 'foo', [true, 42, 'foo'], {}].forEach(value => {
                    const action = Siren.action('create', href, { type: value as string });
                    expect(action.type).toBeUndefined();
                });
            });
        });

        it('should accept extensions', () => {
            const encoding = 'utf-16';

            const link = Siren.action('create', href, { encoding });

            expect(link.encoding).toEqual(encoding);
        });
    });
});

describe('ParsedAction.findFieldByName', () => {
    it('should return field when present', () => {
        const name = 'foo';
        const field = Siren.field(name);
        const action = Siren.action('create', href, { fields: [field] });

        const result = action.findFieldByName(name);

        expect(result?.name).toEqual(name);
    });

    it('should return undefined when absent', () => {
        const action = Siren.action('create', href);

        const result = action.findFieldByName('foo');

        expect(result).toBeUndefined();
    });
});

describe('ParsedAction.updateField', () => {
    it('should return new action with updated field', () => {
        const name = 'foo';
        const action = Siren.action('create', href, {
            fields: [{ name, value: 'bar' }]
        });
        const updatedValue = 'baz';

        const result = action.updateField(name, updatedValue);

        expect(result.name).toEqual(action.name);
        expect(result.href).toEqual(action.href);
        expect(result.fields?.length).toEqual(action.fields?.length);
        expect(result.fields?.[0].name).toEqual(action.fields?.[0].name);
        expect(result.fields?.[0].value).toEqual(updatedValue);
    });

    it('should return same action when field is absent', () => {
        const action = Siren.action('create', href, {
            fields: [
                { name: 'foo' }
            ]
        });

        const result = action.updateField('bar', 'baz');

        expect(result).toBe(action);
    });

    it('should return same action when fields are absent', () => {
        const action = Siren.action('create', href);

        const result = action.updateField('bar', 'baz');

        expect(result).toBe(action);
    });
});

describe('action type guard', () => {
    it('should return true for valid actions', () => {
        const values: Siren.Action[] = [
            // minimal
            { name: 'create', href },
            // kitchen sink
            {
                name: 'create',
                href,
                method: 'POST',
                class: ['order'],
                title: 'Create Order',
                type: 'multipart/form-data',
                fields: [
                    { name: 'orderNumber', type: 'hidden', value: '42' },
                    { name: 'productCode' },
                    { name: 'quantity', type: 'number' }
                ]
            },
            // with extension
            { name: 'create', href, encoding: 'utf-16' }
        ];

        values.forEach(value => {
            expect(Siren.isAction(value)).toEqual(true);
        });
    });

    it('should return false for invalid actions', () => {
        const values = [
            // non-records
            undefined, null, true, 42, 'foo', [],
            // empty record
            {},
            // invalid name
            { name: 42, href },
            // invalid href
            { name: 'create', href: 'http://\uFFFF.com' },
            // invalid class
            { name: 'create', href, class: 'order' },
            // invalid fields
            { name: 'create', href, fields: 'orderNumber' },
            { name: 'create', href, fields: [null] },
            { name: 'create', href, fields: [42] },
            { name: 'create', href, fields: ['orderNumber'] },
            // duplicate field names
            {
                name: 'create',
                href,
                fields: [
                    { name: 'orderNumber', type: 'hidden', value: '42' },
                    { name: 'orderNumber', type: 'number' }
                ]
            },
            // invalid method
            { name: 'create', href, method: 42 },
            // invalid title
            { name: 'create', href, title: 42 },
            // invalid type
            { name: 'create', href, type: 'order' }
        ];

        values.forEach(value => {
            expect(Siren.isAction(value)).toEqual(false);
        });
    });
});
