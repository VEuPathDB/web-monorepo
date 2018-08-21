import { RESTRICTED_ACTION, UNRESTRICTED_ACTION, RESTRICTION_CLEARED } from './DataRestrictionActionCreators';

export default function reduce(state, action) {
  switch(action.type) {
    case RESTRICTED_ACTION: return action.payload;
    case UNRESTRICTED_ACTION: return undefined;
    case RESTRICTION_CLEARED: return undefined;
    default: return state;
  }
}