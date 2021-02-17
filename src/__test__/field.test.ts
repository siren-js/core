import * as Siren from '../field';

describe('field function', () => {
    it('should create ParsedField from name', () => {
        const name = 'orderNumber';

        const field = Siren.field(name);

        expect(field.name).toEqual(name);
        expect(field.class).toBeUndefined();
        expect(field.title).toBeUndefined();
        expect(field.type).toBeUndefined();
        expect(field.value).toBeUndefined();
        expect(field.update).toBeInstanceOf(Function);
    });

    it('should accept optional members as object', () => {
        const name = 'orderNumber';
        const cls = ['integer'];
        const title = 'Order Number';
        const type = 'number';
        const value = 69;

        const field = Siren.field(name, { class: cls, title, type, value });

        expect(field.name).toEqual(name);
        expect(field.class).toEqual(cls);
        expect(field.title).toEqual(title);
        expect(field.type).toEqual(type);
        expect(field.value).toEqual(value);
    });

    it('should accept extensions', () => {
        const min = 0;

        const field = Siren.field('orderNumber', { min });

        expect(field.min).toEqual(min);
    });

    it('should create immutable object', () => {
        const field = Siren.field('orderNumber', {
            class: ['integer'],
            title: 'Order Number',
            type: 'number',
            value: 69,
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

    describe('name parameter', () => {
        it('should accept any string', () => {
            ['', 'foo', 'foo bar'].forEach(name => {
                const field = Siren.field(name);
                expect(field.name).toEqual(name);
            });
        });

        it('should coerce to string', () => {
            const cases = [
                [undefined, ''],
                [null, ''],
                [true, 'true'],
                [69, '69'],
                ['foo', 'foo'],
                [[true, 69, 'foo'], 'true,69,foo'],
                [{}, '[object Object]']
            ];

            cases.forEach(([value, expected]) => {
                const field = Siren.field(value as string);
                expect(field.name).toEqual(expected);
            });
        });
    });

    describe('class option', () => {
        it('should accept any string array', () => {
            [[], ['order'], ['customer', 'info']].forEach(value => {
                const field = Siren.field('name', { class: value });
                expect(field.class).toEqual(value);
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
                const field = Siren.field('name', { class: value as string[] });
                expect(field.class).toEqual(expected);
            });
        });
    });

    describe('title option', () => {
        it('should accept any string value', () => {
            ['', 'foo', 'foo bar'].forEach(value => {
                const field = Siren.field('name', { title: value });
                expect(field.title).toEqual(value);
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
                const field = Siren.field('name', { title: value as string });
                expect(field.title).toEqual(expected);
            });
        });
    });

    describe('type option', () => {
        it('should accept any string value', () => {
            ['', 'foo', 'foo bar'].forEach(value => {
                const field = Siren.field('name', { type: value });
                expect(field.type).toEqual(value);
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
                const field = Siren.field('name', { type: value as string });
                expect(field.type).toEqual(expected);
            });
        });
    });

    describe('value option', () => {
        it('should accept any value', () => {
            [undefined, null, true, 69, 'foo', [true, 69, 'foo'], { a: 1, b: 2 }].forEach(value => {
                const field = Siren.field('name', { value });
                expect(field.value).toEqual(value);
            });
        });
    });
});

describe('ParsedField.update', () => {
    it('should create new ParsedField with given value', () => {
        const originalValue = 69;
        const newValue = 420;
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
