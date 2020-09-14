import {
  string,
  number,
  boolean,
  nullValue,
  constant,
  optional,
  objectOf,
  arrayOf,
  field,
  record,
  combine,
  oneOf,
  lazy,
  decode,
  Decoder,
} from 'wdk-client/Utils/Json';

const js = JSON.stringify;

describe('decode string', () => {
  it('should decode a string', () => {
    expect(decode(string, js("one"))).toBe("one");
    expect(() => decode(string, "one")).toThrow();
    expect(() => decode(string, js({ a: 1 }))).toThrow();
  });
});

describe('decode number', () => {
  it('should decode a number', () => {
    expect(decode(number, js(1))).toBe(1);
    expect(() => decode(number, js('one'))).toThrow();
  });
});

describe('decode boolean', () => {
  it('should decode a boolean', () => {
    expect(decode(boolean, js(true))).toBe(true);
    expect(decode(boolean, js(false))).toBe(false);
    expect(() => decode(boolean, js("true"))).toThrow();
  });
})

describe('decode nullValue', () => {
  it('should decode a null', () => {
    expect(decode(nullValue, js(null))).toBe(null);
    expect(() => decode(nullValue, js(undefined))).toThrow();
  });
})

describe('decode constant', () => {
  it('should decode a literal value', () => {
    expect(decode(constant('test'), js('test'))).toBe('test');
    expect(decode(constant(1), js(1))).toBe(1);
    expect(() => decode(constant('test'), js('other'))).toThrow();
    expect(() => decode(constant(1), js(2))).toThrow();
  });
})

describe('decode objectOf', () => {
  it('should decode an object', () => {
    const o = { a: 1, b: 2, c: 3, }
    expect(decode(objectOf(number), js(o))).toEqual(o);
    expect(() => decode(objectOf(string), js(o))).toThrow();
  });
})

describe('decode arrayOf', () => {
  it('should decode an array', () => {
    const a = [ 1, 2, 3, ]
    expect(decode(arrayOf(number), js(a))).toEqual(a);
    expect(() => decode(arrayOf(string), js(a))).toThrow();
  });
})

describe('decode field', () => {
  it('should decode an object field', () => {
    const expected = { name: 'Dave', age: 30 };
    const raw = js(expected);
    expect(decode(field("name", string), raw)).toEqual(expected);
    expect(() => decode(field('name', number), raw)).toThrow();
  });
});

describe('decode record', () => {
  it('should decode a record', () => {
    const expected = { name: 'Dave', age: 30 };
    const raw = js(expected);
    expect(decode(record({ name: string }), raw)).toEqual(expected);
    expect(() => decode(record({ name: number }), raw)).toThrow();
  });
});

describe('decode combine', () => {
  it('should decode combined decoders', () => {
    const expected = { name: 'Dave', age: 30 };
    const raw = js(expected);
    const person = combine(
      field('name', string),
      field('age', number)
    );
    expect(decode(person, raw)).toEqual(expected);
    expect(() => decode(person, js({ name: 'dave', age: '20' }))).toThrow();
  });
})

describe('decode oneOf', () => {
  it('should decode oneOf decoder', () => {
    const key = oneOf(
      constant('name'),
      constant('age'),
      constant('address')
    );
    expect(decode(key, js('name'))).toBe('name');
    expect(decode(key, js('age'))).toBe('age');
    expect(decode(key, js('address'))).toBe('address');
    expect(() => decode(key, js('street'))).toThrow();
  });
})

describe('decode complex', () => {
  it('should handle complex scenarios', () => {
    const good = {
      name: 'Dave',
      age: 30,
      address: {
        street: '123 Main St',
        city: 'Centerville',
        state: 'IL',
        zip: 123456
      },
      maritalStatus: 'married',
      dependents: 4,
    };
    const employee = combine(
      field('name', string),
      field('age', number),
      field('address', combine(
        field('street', string),
        field('city', string),
        field('state', string),
        field('zip', number),
      )),
      field('maritalStatus', oneOf(constant('married'), constant('single'))),
      field('dependents', number),
      field('hobbies', optional(arrayOf(string)))
    );
    expect(decode(employee, js(good))).toEqual(good);
    expect(decode(employee, js({ ...good, hobbies: [ 'kicking', 'screaming' ] })))
      .toEqual({ ...good, hobbies: [ 'kicking', 'screaming' ] });
    expect(() => decode(employee, js({ ...good, hobbies: 'kicking and screaming' }))).toThrow();
  });
})

describe('decode lazy', () => {
  it('should allow deferred decoder definition', () => {
    // Recursive structures require an explicit type definition
    type Tree = {
      data: number;
      children?: Tree[];
    }
    const tree: Decoder<Tree> = combine(
      field('data', number),
      field('children', lazy(() => optional(arrayOf(tree))))
    )

    const myTree = {
      data: 1,
      children: [
        {
          data: 2,
          children: [
            {
              data: 3
            },
            {
              data: 4
            }
          ]
        },
        {
          data: 5
        }
      ]
    }
    expect(decode(tree, js(myTree))).toEqual(myTree);
  });
});
