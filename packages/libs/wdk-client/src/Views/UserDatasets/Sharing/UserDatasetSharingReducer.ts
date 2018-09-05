import { Reducer } from '../../../Utils/ReducerUtils';
import { differenceWith, unionWith } from 'lodash';

import { Action, makeActionCreator } from '../../../Utils/ActionCreatorUtils';
import { composeReducers, matchAction } from '../../../Utils/ReducerUtils';
import { UserDataset, UserDatasetShare } from '../../../Utils/WdkModel';

import { SharingSuccessAction } from '../UserDatasetsActionCreators';

type Response = SharingSuccessAction['payload']['response'];
type ShareOperation = keyof Response;
type Shares = Response[ShareOperation];

type State = Record<string, {
  isLoading: boolean;
  resource?: UserDataset
}>;

const SharingAction =
  makeActionCreator<SharingSuccessAction['payload'], SharingSuccessAction['type']>('user-datasets/sharing-success')

const handleAdd = handleOperation('add');
const handleDelete = handleOperation('delete');

export default <Reducer<State>>matchAction({} as State,
  [ SharingAction, (state, payload) => handleAdd(handleDelete(state, payload), payload) ]
)

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
      const operator = operation === 'add' ? unionWith : differenceWith;
      const sharedWith = operator(entry.resource.sharedWith, shares, shareComparator);

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
