import * as i from 'wdk-client/Utils/IterableUtils';

/**
 * generate list of natural numbers
 */
function* nat(max = 10000) {
  let n = 1;
  while(n <= max) {
    yield n++;
  }
}

test('Seq', () => {
  let s = i.Seq.from([1,2,3]);

  expect(s.map(n => n * n).toArray()).toEqual([ 1, 4, 9 ]);

  let mapCallCount = 0;
  let result = i.Seq.from(nat())
    .map(n => (mapCallCount++, n * n))
    .takeWhile(n => n < 30)
    .reduce((sum, n) => sum + n, 0)

  expect(mapCallCount).toBe(6);
  expect(result).toBe(55);


  let s2 = i.Seq.from(s).map(n => n * 2);
  expect(s2.toArray()).toEqual([ 2, 4, 6 ]);

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

test('concat', function() {
  expect([...i.concat([1, 2, 3], [4, 5, 6])]).toEqual([1, 2, 3, 4, 5, 6]);

});

test('map', function() {
  expect(
    Array.from(i.map(c => c.name, [ { name: 'A' }, { name: 'B' }, { name: 'C' } ]))
  ).toEqual([ 'A', 'B', 'C' ]);

});

test('flatMap', function() {
  expect(
    Array.from(i.flatMap(c => c.name, [ { name: 'ABC' }, { name: 'DEF' }, { name: 'GHI' } ]))
  ).toEqual([ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I' ]);

});

test('uniq', function() {
  expect(Array.from(i.uniq([ 1, 2, 3, 2, 1, 4, 5, 6 ]))).toEqual([ 1, 2, 3, 4, 5, 6 ]);

});

test('uniqBy', function() {
  const source = [ { a: 1}, { a: 1} ];
  expect(Array.from(i.uniqBy(n => n.a, source))).toEqual([ { a: 1} ]);
  expect(Array.from(i.uniqBy(n => n, source))).not.toEqual([ { a: 1} ]);
});

test('filter', function() {
  expect(Array.from(i.filter(n => n % 2 === 0, [1,2,3,4,5,6,7,8,9,10]))).toEqual([2,4,6,8,10]);

});

test('take', function() {
  expect(Array.from(i.take(10, [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]))).toEqual([1,2,3,4,5,6,7,8,9,10]);

});

test('takeLast', function() {
  expect(Array.from(i.takeLast(10, [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]))).toEqual([6,7,8,9,10,11,12,13,14,15]);

  expect(Array.from(i.takeLast(-10, [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]))).toEqual([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);

});

test('takeWhile', function() {
  expect(Array.from(i.takeWhile(n => n < 10, [1,2,3,4,5,6,7,8,9,10,11]))).toEqual([1,2,3,4,5,6,7,8,9]);

});

test('drop', function() {
  expect([ ...i.drop(1, [1,2,3,4,5,6,7,8,9,10,11]) ]).toEqual([2,3,4,5,6,7,8,9,10, 11]);

});

test('dropLast', function() {
  expect([ ...i.dropLast(1, [1,2,3,4,5,6,7,8,9,10,11]) ]).toEqual([1,2,3,4,5,6,7,8,9,10]);

  expect([ ...i.dropLast(-1, [1,2,3,4,5,6,7,8,9,10,11]) ]).toEqual([]);

});

test('dropWhile', function() {
  expect(Array.from(i.dropWhile(n => n < 10, [1,2,3,4,5,6,7,8,9,10,11]))).toEqual([10, 11]);

});

test('find', function() {
  expect(i.find(n => n > 10, [ 1,2,3,4,5,6,7,8,9,10,11 ])).toBe(11);

});

test('findLast', function() {
  expect(i.findLast(n => n > 10, [ 1,2,3,4,5,6,7,8,9,10,11,12 ])).toBe(12);

});

test('first', function() {
  expect(i.first([ 1,2,3,4,5,6,7,8,9,10,11])).toBe(1);
});

test('last', function() {
  expect(i.last([1,2,3,4,5,6,7,8,9,10])).toBe(10);
});

test('some', function() {
  expect(i.some(n => n > 1, [0, 1, 2])).toBe(true);
  expect(i.some(n => n > 2, [0, 1, 2])).toBe(false);
});

test('every', function() {
  expect(i.every(n => n >= 0, [0, 1, 2])).toBe(true);
  expect(i.every(n => n < 2, [0, 1, 2])).toBe(false);
});

test('reduce', function() {
  expect(i.reduce((acc, n) => acc + n, 5, [1,2,3,4,5,6,7,8,9,10])).toBe(60);
});

test('join', function() {
  expect(i.join(',', [])).toBe('');
  expect(i.join(',', [1,2,3])).toBe('1,2,3');
});
