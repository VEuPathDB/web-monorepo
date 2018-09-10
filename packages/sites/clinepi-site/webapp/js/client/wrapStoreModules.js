import { compose, curryN, update } from 'lodash/fp';
import { combineReducers } from 'redux';
import studies from 'Client/App/Studies/StudyReducer';
import dataRestriction from 'Client/App/DataRestriction/DataRestrictionReducer';

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

const reduceGlobalData = combineReducers({
  dataRestriction,
  studies,
});

export default compose(
  update('globalData.reduce', composeReducerWith(reduceGlobalData))
)