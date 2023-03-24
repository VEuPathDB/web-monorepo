import { makeActionCreator } from '../../Utils/ActionCreatorUtils';

describe('makeActionCreator', () => {
  it('should accept only a type string', () => {
    expect(() => {
      const ac = makeActionCreator('test');
    }).not.toThrow();
  });

  it('should accept a type string and a payload creation function', () => {
    expect(() => {
      const ac = makeActionCreator('test', (name: string) => ({ name }));
    }).not.toThrow();
  });

  it('should expose the type string', () => {
    const ac = makeActionCreator('test');
    expect(ac.type).toBe('test');
  });
});

describe('ActionCreator', () => {
  const acWithoutPayload = makeActionCreator('no payload');

  const acWithPayload = makeActionCreator('payload', (name: string) => ({
    name,
  }));

  it('should return the expected action', () => {
    expect(acWithoutPayload()).toEqual({
      type: 'no payload',
      payload: undefined,
    });
    expect(acWithPayload('foo')).toEqual({
      type: 'payload',
      payload: { name: 'foo' },
    });
  });
});
