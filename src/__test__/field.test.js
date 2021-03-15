import { Field } from '../field';

const name = 'quantity';

describe('Field constructor', () => {
    it('should throw TypeError when given no arguments', () => {
        expect(() => new Field()).toThrow(TypeError);
    });

    it('should handle null options gracefully', () => {
        expect(() => new Field(name, null)).not.toThrow();
    });
});

describe('Field.name', () => {
    it('should accept any string', () => {
        [name, 'order number', ''].forEach((value) => {
            const field = new Field(value);
            expect(field.name).toEqual(value);
        });
    });

    it('should throw error given non-string in constructor', () => {
        [undefined, null, true, 42, [true, 42, 'foo'], { foo: 'bar' }].forEach(
            (value) => {
                expect(() => new Field(value)).toThrow(TypeError);
            }
        );
    });

    it('should be read-only', () => {
        const field = new Field(name);
        expect(() => (field.name = 'foo')).toThrow(TypeError);
    });
});

describe('Field.class', () => {
    it('should accept any array of strings', () => {
        [['integer'], ['positive', 'integer'], []].forEach((value) => {
            let field = new Field(name, { class: value });
            expect(field.class).toEqual(value);
        });
    });

    it('should coerce string to singleton array', () => {
        ['integer', ''].forEach((value) => {
            const field = new Field(name, { class: value });
            expect(field.class).toEqual([value]);
        });
    });

    it('should allow undefined and coerce null', () => {
        [undefined, null].forEach((value) => {
            const field = new Field(name, { class: value });
            expect(field.class).toBeUndefined();
        });
    });

    it('should remove non-strings from array', () => {
        const field = new Field(name, {
            class: [true, 42, 'integer', null, undefined]
        });

        expect(field.class).toEqual(['integer']);
    });

    it('should ignore invalid value', () => {
        [true, 42, {}].forEach((value) => {
            const field = new Field(name, { class: value });
            expect(field.class).toBeUndefined();
        });
    });
});

describe('Field.title', () => {
    const title = 'This is a Field';

    it('should accept any string', () => {
        [title, 'Å Fâñçÿ Títlè', ''].forEach((value) => {
            let field = new Field(name, { title: value });
            expect(field.title).toEqual(value);

            field = new Field(name);
            field.title = value;
            expect(field.title).toEqual(value);
        });
    });

    it('should ignore non-string value', () => {
        [true, 42, [], {}].forEach((value) => {
            let field = new Field(name, { title: value });
            expect(field.title).toBeUndefined();

            field = new Field(name, { title });
            field.title = value;
            expect(field.title).toEqual(title);
        });
    });

    it('should allow undefined and coerce null to undefined', () => {
        [undefined, null].forEach((value) => {
            let field = new Field(name, { title: value });
            expect(field.title).toBeUndefined();

            field = new Field(name, { title });
            field.title = value;
            expect(field.title).toBeUndefined();
        });
    });
});

describe('Field.type', () => {
    const type = 'number';

    it('should accept any string', () => {
        [type, 'nümbér', ''].forEach((value) => {
            let field = new Field(name, { type: value });
            expect(field.type).toEqual(value);

            field = new Field(name);
            field.type = value;
            expect(field.type).toEqual(value);
        });
    });

    it('should ignore non-string value', () => {
        [true, 42, [], {}].forEach((value) => {
            let field = new Field(name, { type: value });
            expect(field.type).toBeUndefined();

            field = new Field(name, { type });
            field.type = value;
            expect(field.type).toEqual(type);
        });
    });

    it('should allow undefined and coerce null to undefined', () => {
        [undefined, null].forEach((value) => {
            let field = new Field(name, { type: value });
            expect(field.type).toBeUndefined();

            field = new Field(name, { type });
            field.type = value;
            expect(field.type).toBeUndefined();
        });
    });
});

describe('Field.value', () => {
    it('should accept any non-nullish value', () => {
        [true, 42, 'foo', [true, 42, 'foo'], { foo: 'bar' }].forEach(
            (value) => {
                const field = new Field(name, { value });
                expect(field.value).toEqual(value);
            }
        );
    });

    it('should allow undefined and coerce null to undefined', () => {
        [undefined, null].forEach((value) => {
            let field = new Field(name, { value });
            expect(field.value).toBeUndefined();

            field = new Field(name, { value: 42 });
            field.value = value;
            expect(field.value).toBeUndefined();
        });
    });
});

test('Field extensions', () => {
    const min = 1;
    const step = '2';

    const field = new Field(name, { min });
    field.step = step;

    expect(field.min).toEqual(min);
    expect(field.step).toEqual(step);
});

test('Field serialization', () => {
    const field = new Field(name, {
        class: ['integer'],
        title: 'Quantity',
        type: 'number',
        value: 9,
        min: 1,
        step: '2'
    });

    const json = JSON.stringify(field, null, 2);

    expect(json).toMatchSnapshot();
});
