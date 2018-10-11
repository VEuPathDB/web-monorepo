import { RESTRICTED_ACTION, UNRESTRICTED_ACTION, RESTRICTION_CLEARED } from './DataRestrictionActionCreators';

export default function reduce(state = null, action) {
  switch(action.type) {
    case RESTRICTED_ACTION: return action.payload;
    case UNRESTRICTED_ACTION: return null;
    case RESTRICTION_CLEARED: return null;
    default: return state;
  }
}