import { compose, curryN, set, update } from 'lodash/fp';
import * as globalData from './storeModules/GlobalData';
import * as record from './storeModules/Record';

/**
 * Compose reducer functions from right to left. In other words, the
 * last reducer provided is called first, the second to last is called
 * second, and so on.
 */
const composeReducers = (...reducers) => (state, action) =>
  reducers.reduceRight((state, reducer) => reducer(state, action), state);

/**
 * Curried with fixed size of two arguments.
 */
const composeReducerWith = curryN(2, composeReducers);

export default compose(
  update('globalData.reduce', composeReducerWith(globalData.reduce)),
  set('record', record)
)


