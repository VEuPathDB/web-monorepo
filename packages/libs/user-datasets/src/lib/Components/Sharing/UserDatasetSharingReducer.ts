import { differenceWith, unionWith, union, Comparator } from 'lodash';

import { UserDataset, UserDatasetShare } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import {
  Action,
  SharingSuccessAction,
  SHARING_SUCCESS
} from '../../Actions/UserDatasetsActions';

type Response = SharingSuccessAction['payload']['response'];
type ShareOperation = keyof Response;

type State = Record<string, {
  isLoading: boolean;
  resource?: UserDataset
}>;

const initialState: State = { }

const handleAdd = handleOperation('add');
const handleDelete = handleOperation('delete');

export default function reduce(state: State = initialState, action: Action): State {
  switch(action.type) {
    case SHARING_SUCCESS:
      return handleAdd(handleDelete(state, action.payload), action.payload)
    default:
      return state;
  }
}

function handleOperation(operation: ShareOperation) {
  return function (state: State, payload: SharingSuccessAction['payload']): State {
    const sharesByTargetId = payload.response[operation];

    if (sharesByTargetId == null) return state;

    return Object.entries(sharesByTargetId).reduce((state, [userDatasetId, shares]) => {
      const entry = state[userDatasetId];
      // entry can be undefined
      if (entry == null || entry.resource == null || shares == null) {
        return state;
      }
      const sharedWith = operation === 'add'
        ?      unionWith(entry.resource.sharedWith, shares, shareComparator)
        : differenceWith(entry.resource.sharedWith, shares, shareComparator);

      return {
        ...state,
        [userDatasetId]: {
          ...entry,
          resource: {
            ...entry.resource,
            sharedWith
          }
        }
      };
    }, state)
  }
}

function shareComparator(share1: UserDatasetShare, share2: UserDatasetShare) {
  return share1.user === share2.user;
}
