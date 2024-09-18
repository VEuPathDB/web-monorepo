import { differenceWith, unionWith } from 'lodash';
import { SHARING_SUCCESS } from '../../Actions/UserDatasetsActions';
const initialState = {};
const handleAdd = handleOperation('add');
const handleDelete = handleOperation('delete');
export default function reduce(state = initialState, action) {
  switch (action.type) {
    case SHARING_SUCCESS:
      return handleAdd(handleDelete(state, action.payload), action.payload);
    default:
      return state;
  }
}
function handleOperation(operation) {
  return function (state, payload) {
    const sharesByTargetId = payload.response[operation];
    if (sharesByTargetId == null) return state;
    return Object.entries(sharesByTargetId).reduce(
      (state, [userDatasetId, shares]) => {
        const entry = state[userDatasetId];
        // entry can be undefined
        if (entry == null || entry.resource == null || shares == null) {
          return state;
        }
        const sharedWith =
          operation === 'add'
            ? unionWith(entry.resource.sharedWith, shares, shareComparator)
            : differenceWith(
                entry.resource.sharedWith,
                shares,
                shareComparator
              );
        return Object.assign(Object.assign({}, state), {
          [userDatasetId]: Object.assign(Object.assign({}, entry), {
            resource: Object.assign(Object.assign({}, entry.resource), {
              sharedWith,
            }),
          }),
        });
      },
      state
    );
  };
}
function shareComparator(share1, share2) {
  return share1.user === share2.user;
}
//# sourceMappingURL=UserDatasetSharingReducer.js.map
