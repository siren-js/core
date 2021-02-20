import * as Siren from '../field';

describe('field function', () => {
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
            const field = Siren.field(value as string);
            expect(field.name).toEqual(expected);
        });
    });

    describe('optional parameter', () => {
        it('should set optional members to undefined when empty', () => {
            const name = 'orderNumber';

            const field = Siren.field(name);

            expect(field.name).toEqual(name);
            expect(field.class).toBeUndefined();
            expect(field.title).toBeUndefined();
            expect(field.type).toBeUndefined();
            expect(field.value).toBeUndefined();
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
                const field = Siren.field('name', { class: value as string[] });
                expect(field.class).toEqual(expected);
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
                const field = Siren.field('name', { title: value as string });
                expect(field.title).toEqual(expected);
            });
        });

        it('should coerce type option to string or undefined', () => {
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
                const field = Siren.field('name', { type: value as string });
                expect(field.type).toEqual(expected);
            });
        });

        it('should not modify value option', () => {
            [undefined, null, true, 42, 'foo', [true, 42, 'foo'], { a: 1, b: 2 }].forEach(value => {
                const field = Siren.field('name', { value });
                expect(field.value).toEqual(value);
            });
        });

        it('should accept extensions', () => {
            const min = 0;

            const field = Siren.field('orderNumber', { min });

            expect(field.min).toEqual(min);
        });
    });


    it('should create immutable object', () => {
        const field = Siren.field('orderNumber', {
            class: ['integer'],
            title: 'Order Number',
            type: 'number',
            value: 42,
            min: 0
        });

        const mutations: ((field: Siren.Field) => void)[] = [
            field => (field.name as string) = 'foo',
            field => (field.class as string[]) = ['foo'],
            field => (field.class as string[])[0] = 'foo',
            field => (field.title as string) = 'foo',
            field => (field.type as string) = 'foo',
            field => (field.value as number) = 42,
            field => (field.min as number) = 1
        ];

        mutations.forEach(mutate => {
            expect(() => mutate(field)).toThrow(TypeError);
        });
    });
});

describe('ParsedField.update', () => {
    it('should create new ParsedField with given value', () => {
        const originalValue = 42;
        const newValue = 43;
        const field = Siren.field('orderNumber', {
            title: 'Order Number',
            type: 'number',
            value: originalValue
        });

        const result = field.update(newValue);

        expect(result).not.toBe(field);
        expect(field.value).toEqual(originalValue);
        expect(result.value).toEqual(newValue);
    });
});

describe('field type guard', () => {
    it('should return true for valid fields', () => {
        const values: Siren.Field[] = [
            // minimal
            { name: 'orderNumber' },
            // kitchen sink
            {
                name: 'orderNumber',
                class: ['integer'],
                title: 'Order Number',
                type: Siren.FieldType.Number,
                value: 42
            },
            // with extension
            { name: 'orderNumber', min: 0 }
        ];

        values.forEach(value => {
            expect(Siren.isField(value)).toEqual(true);
        });
    });

    it('should return false for invalid links', () => {
        const values = [
            // non-records
            undefined, null, true, 42, 'foo', [],
            // empty record
            {},
            // invalid name
            { name: true },
            // invalid class
            { name: 'orderNumber', class: 'order' },
            // invalid title
            { name: 'orderNumber', title: 42 },
            // invalid type
            { name: 'orderNumber', type: 42 }
        ];

        values.forEach(value => {
            expect(Siren.isField(value)).toEqual(false);
        });
    });
});
