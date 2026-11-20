import * as util from '../Utils';
import * as actions from './ManagementViewActions';

import { DatasetGetResponseBody } from '../Service';

export type State = {
  readonly datasetDetails: util.Possible<DatasetGetResponseBody>;
  readonly datasetFetchState: util.Possible<actions.DatasetFetchState>;
  readonly communityUpdateState: util.Possible<actions.CommunityUpdateActionState>;
};

export function reduce(state: State, { type, payload }: actions.Action): State {
  switch (type) {
    case actions.setCommunityUpdateState.type:
      return { ...state, communityUpdateState: payload };

    case actions.setDatasetFetchState.type:
      return {
        ...state,
        datasetFetchState: payload.type,
        datasetDetails: payload.dataset,
      };

    default:
      console.warn(`unrecognized action type: ${type}`);
      return state;
  }
}

export default State;