import { Study } from '../shared/studies';
import {
  Action,
  DataRestrictionActionType,
  clearRestrictions,
  restricted,
  unrestricted,
} from './DataRestrictionActionCreators';

type State = {
  study: Study,
  action: DataRestrictionActionType
} | null;

export default function reduce(state: State = null, action: Action): State {
  switch(action.type) {
    case restricted.type: return action.payload;
    case unrestricted.type: return null;
    case clearRestrictions.type: return null;
    default: return state;
  }
}
