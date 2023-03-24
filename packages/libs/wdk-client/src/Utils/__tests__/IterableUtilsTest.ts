import * as i from '../../Utils/IterableUtils';

/**
 * generate list of natural numbers
 */
function* nat(max = 10000) {
  let n = 1;
  while (n <= max) {
    yield n++;
  }
}

describe('Seq basic API', () => {
  let s = i.Seq.from([1, 2, 3]);

  it('should work as expected', () => {
    expect(s.map((n) => n * n).toArray()).toEqual([1, 4, 9]);

    let mapCallCount = 0;
    let result = i.Seq.from(nat())
      .map((n) => (mapCallCount++, n * n))
      .takeWhile((n) => n < 30)
      .reduce((sum, n) => sum + n, 0);

    expect(mapCallCount).toBe(6);
    expect(result).toBe(55);

    let s2 = i.Seq.from(s).map((n) => n * 2);
    expect(s2.toArray()).toEqual([2, 4, 6]);

    /*
    function* gen() {
      yield 1;
      yield 2;
      yield 3;
    }

    let seqOfGen = i.seq(gen());
    t.is(
      seqOfGen.first(),
      seqOfGen.first(),
      'seq should be reusable'
    );
    */
  });
});

describe('concat', function () {
  it('should concatentate one sequence with another', () => {
    expect([...i.concat([1, 2, 3], [4, 5, 6])]).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe('map', function () {
  it('should create a new sequence, replacing values of original sequence with mapping function', () => {
    expect(
      Array.from(
        i.map((c) => c.name, [{ name: 'A' }, { name: 'B' }, { name: 'C' }])
      )
    ).toEqual(['A', 'B', 'C']);
  });
});

describe('flatMap', function () {
  it('should create a new sequence, tranforming values of original sequence with subsequence returned from mapping function', () => {
    expect(
      Array.from(
        i.flatMap(
          (c) => c.name,
          [{ name: 'ABC' }, { name: 'DEF' }, { name: 'GHI' }]
        )
      )
    ).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']);
  });
});

describe('uniq', function () {
  it('should create a new sequence of unique values found in original sequence, using === semantics with sequence elements', () => {
    expect(Array.from(i.uniq([1, 2, 3, 2, 1, 4, 5, 6]))).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
  });
});

describe('uniqBy', function () {
  it('should create a new sequence of unique values found in original sequence, using === semantics with output of value selector', () => {
    const source = [{ a: 1 }, { a: 1 }];
    expect(Array.from(i.uniqBy((n) => n.a, source))).toEqual([{ a: 1 }]);
    expect(Array.from(i.uniqBy((n) => n, source))).not.toEqual([{ a: 1 }]);
  });
});

describe('filter', function () {
  it('should create a new sequence of elements of the original sequence, which pass the predicate', () => {
    expect(
      Array.from(i.filter((n) => n % 2 === 0, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]))
    ).toEqual([2, 4, 6, 8, 10]);
  });
});

describe('take', function () {
  it('should should create a new sequence of the first N elements of the original sequence', () => {
    expect(
      Array.from(
        i.take(10, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
      )
    ).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});

describe('takeLast', function () {
  it('should create a new sequence of the last N elements of the original sequence', () => {
    expect(
      Array.from(
        i.takeLast(10, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
      )
    ).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(
      Array.from(
        i.takeLast(-10, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
      )
    ).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });
});

describe('takeWhile', function () {
  it('should create a new sequence of elements of the original sequence, while elements pass the predicate', () => {
    expect(
      Array.from(
        i.takeWhile((n) => n < 10, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
      )
    ).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});

describe('drop', function () {
  it('should create a new sequence of elements of the original sequence, omitting the first N elements', () => {
    expect([...i.drop(1, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])]).toEqual([
      2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    ]);
  });
});

describe('dropLast', function () {
  it('should create a new sequence of elements of the original sequence, omitting the last N elements', () => {
    expect([...i.dropLast(1, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])]).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    expect([...i.dropLast(-1, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])]).toEqual(
      []
    );
  });
});

describe('dropWhile', function () {
  it('should create a new sequence of elements of the original sequence, omitting elements that pass the predicate', () => {
    expect(
      Array.from(
        i.dropWhile((n) => n < 10, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
      )
    ).toEqual([10, 11]);
  });
});

describe('find', function () {
  it('should return the first element of the sequence that passes the predicate', () => {
    expect(i.find((n) => n > 10, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])).toBe(11);
  });
});

describe('findLast', function () {
  it('should return the last element of the sequence that passes the predicate', () => {
    expect(
      i.findLast((n) => n > 10, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    ).toBe(12);
  });
});

describe('first', function () {
  it('should return the first element of the sequence', () => {
    expect(i.first([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])).toBe(1);
  });
});

describe('last', function () {
  it('should return the last element of the sequence', () => {
    expect(i.last([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe(10);
  });
});

describe('some', function () {
  it('should return true if at least one element of the sequence passes the predicate', () => {
    expect(i.some((n) => n > 1, [0, 1, 2])).toBe(true);
  });
  it('should return false if no element of the sequence passes the predicate', () => {
    expect(i.some((n) => n > 2, [0, 1, 2])).toBe(false);
  });
});

describe('every', function () {
  it('should return true if every element of the sequence passes the predicate', () => {
    expect(i.every((n) => n >= 0, [0, 1, 2])).toBe(true);
  });
  it('should return false if at least one element of the sequence does not pass the predicate', () => {
    expect(i.every((n) => n < 2, [0, 1, 2])).toBe(false);
  });
});

describe('reduce', function () {
  it('should return a new value by successively combining output of reducer with next element of sequence', () => {
    expect(
      i.reduce((acc, n) => acc + n, 5, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    ).toBe(60);
  });
});

describe('join', function () {
  it('should join elements of a sequence into a string, using the provided separator string', () => {
    expect(i.join(',', [])).toBe('');
    expect(i.join(',', [1, 2, 3])).toBe('1,2,3');
  });
});
