import {
  Action,
  makeActionCreator
} from '../ActionCreatorUtils';

import {
  matchAction,
  combineReducers,
  composeReducers,
  Reducer
} from '../ReducerUtils';

describe('matchAction', () => {
  type State = {
    one: number;
    two: number;
    three: number;
  };
  const initialState: State = {
    one: 0,
    two: 0,
    three: 0
  };
  const AC1 = makeActionCreator('one');
  const AC2 = makeActionCreator('two');
  const AC3 = makeActionCreator('three');
  const AC_ = makeActionCreator('unknown');
  const compositeReduce = matchAction(initialState,
    [ AC1, state => ({ ...state, one: state.one + 1 }) ],
    [ AC2, state => ({ ...state, two: state.two + 1 }) ],
    [ AC3, state => ({ ...state, three: state.three + 1 }) ],
  );

  it('should return a function', () => {
    expect(typeof compositeReduce).toBe('function');
  });

  it('should use initialState if state is undefined', () => {
    expect(compositeReduce(undefined, AC1.create())).toEqual({ one: 1, two: 0, three: 0 });
  });

  it('should call the first reducer that matches the associated action', () => {
    expect(compositeReduce(initialState, AC1.create())).toEqual({ one: 1, two: 0, three: 0 });
    expect(compositeReduce(initialState, AC2.create())).toEqual({ one: 0, two: 1, three: 0 });
    expect(compositeReduce(initialState, AC3.create())).toEqual({ one: 0, two: 0, three: 1 });
  });

  it('should return the same state passed, if nothing matches associated action', () => {
    expect(compositeReduce(initialState, AC_.create())).toBe(initialState);
  });

});

describe('combineReducers', () => {
  const actionA = { type: 'a' };
  const actionB = { type: 'b' };

  const compositeReduce = combineReducers({
    a: (n: number = 0, action: Action) => action.type === 'a' ? n + 1 : n,
    b: (n: number = 1, action: Action) => action.type === 'b' ? n + 2 : n
  });

  it('should return a function', () => {
    expect(typeof compositeReduce).toBe('function');
  });

  it('should use child reduce initialState when passed undefined', () => {
    const expected = { a: 0, b: 1 };
    const actual = compositeReduce(undefined, { type: 'any' });
    expect(actual).toEqual(expected);
  });

  it('should correctly call child reduce functions', () => {
    let state;

    state = compositeReduce(state, actionA);
    expect(state).toEqual({a: 1, b: 1});

    state = compositeReduce(state, actionB);
    expect(state).toEqual({a: 1, b: 3});

    state = compositeReduce(state, actionA);
    expect(state).toEqual({a: 2, b: 3});

    state = compositeReduce(state, actionB);
    expect(state).toEqual({a: 2, b: 5});
  });

});
