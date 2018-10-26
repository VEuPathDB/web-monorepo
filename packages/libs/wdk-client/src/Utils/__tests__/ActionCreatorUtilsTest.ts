import {
  makeActionCreator,
  isOneOf
} from 'wdk-client/Utils/ActionCreatorUtils';

test('makeActionCreator with empty action', () => {
  const AC = makeActionCreator('empty');
  const action = AC.create();
  expect(action.payload).toBeUndefined();
  expect(action.type).toBe('empty');
});

test('makeActionCreator with non-empty action', () => {
  const AC = makeActionCreator<number, 'test'>('test');
  const action = AC.create(1);
  expect(action.payload).toEqual(1);
  expect(action.type).toEqual('test');
});

test('ActionCreator test function', () => {
  const AC = makeActionCreator('a');
  const action = AC.create();
  expect(AC.test(action)).toBe(true);
});

test('isOneOf', () => {
  const AC1 = makeActionCreator('a');
  const AC2 = makeActionCreator('b');
  const AC3 = makeActionCreator('c');
  const is1or2 = isOneOf(AC1, AC2);
  expect(is1or2(AC1.create())).toBe(true);
  expect(is1or2(AC2.create())).toBe(true);
  expect(is1or2(AC3.create())).toBe(false);
});
